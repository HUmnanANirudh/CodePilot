import os
import re
from typing import List, Dict, Any, Optional
from .github_client import GitHubClient

try:
    import tree_sitter
    from tree_sitter_python import language as ts_python_lang
    from tree_sitter_javascript import language as ts_js_lang

    def _create_ts_parser(lang: str):
        parser = tree_sitter.Parser()
        if lang == 'python':
            lang_obj = tree_sitter.Language(ts_python_lang())
        elif lang == 'javascript':
            lang_obj = tree_sitter.Language(ts_js_lang())
        else:
            return None
        parser.language = lang_obj
        return parser

    _TS_PARSERS = {
        'python': _create_ts_parser('python'),
        'javascript': _create_ts_parser('javascript'),
    }
    HAS_TREESITTER = True
except ImportError:
    HAS_TREESITTER = False

class ImportParser:
    def __init__(self, github_client: GitHubClient):
        self.github_client = github_client

    SOURCE_EXTENSIONS = frozenset({
        '.py', '.js', '.jsx', '.ts', '.tsx',
        '.vue', '.svelte', '.go', '.rs', '.java',
        '.c', '.cpp', '.h', '.hpp', '.cs', '.rb', '.swift',
    })

    def _lang_for_file(self, file_path: str) -> Optional[str]:
        """Map file extension to language for parsing."""
        ext_map = {
            '.py': 'python',
            '.js': 'javascript', '.jsx': 'javascript',
            '.ts': 'javascript', '.tsx': 'javascript',
            '.vue': 'javascript', '.svelte': 'javascript',
            '.go': 'go', '.rs': 'rust', '.java': 'java',
            '.c': 'c', '.cpp': 'cpp', '.h': 'c', '.hpp': 'cpp',
            '.cs': 'csharp', '.rb': 'ruby',
        }
        for ext, lang in ext_map.items():
            if file_path.endswith(ext):
                return lang
        return None

    def _content_has_imports(self, content: str) -> bool:
        """Quick heuristic: does content look like a source file with imports?"""
        first_lines = content[:400]
        patterns = [
            r'\bimport\s+\w', r'\bfrom\s+\.', r'\brequire\s*\(',
            r'\bimport\s*\(', r'#include\s*["<]', r'\busing\s+\w+;',
        ]
        for p in patterns:
            if re.search(p, first_lines):
                return True
        return False

    def _parse_imports(self, file_path: str, content: str) -> List[str]:
        """Parse imports based on file extension or content heuristic."""
        lang = self._lang_for_file(file_path)
        if lang in _TS_PARSERS and _TS_PARSERS.get(lang):
            result = self._parse_with_treesitter(content, lang)
            if result:
                return result
        # Fallback to regex if tree-sitter failed or lang unknown
        if lang == 'python' or (not lang and self._content_has_imports(content)):
            return self._parse_python_imports_regex(content)
        if lang in ('javascript', 'go', 'rust', 'java', 'c', 'cpp', 'csharp', 'ruby'):
            return self._parse_js_imports_regex(content)
        if self._content_has_imports(content):
            return self._parse_js_imports_regex(content)
        return []

    def _parse_python_imports(self, content: str) -> List[str]:
        if HAS_TREESITTER and _TS_PARSERS.get('python'):
            return self._parse_with_treesitter(content, 'python')
        return self._parse_python_imports_regex(content)

    def _parse_js_imports(self, content: str) -> List[str]:
        if HAS_TREESITTER and _TS_PARSERS.get('javascript'):
            return self._parse_with_treesitter(content, 'javascript')
        return self._parse_js_imports_regex(content)

    def get_dependencies(self, owner: str, repo: str, file_tree: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        Parses imports for every source file via the GitHub contents API.
        For large repos (4000+ source files), this can take several minutes.
        We fetch each file's raw content one by one.
        """
        dependencies = []
        all_files = [item['path'] for item in file_tree if item['type'] == 'blob']
        file_set = set(all_files)

        source_files = [f for f in all_files if any(f.endswith(ext) for ext in self.SOURCE_EXTENSIONS)]

        print(f"Parsing imports for {len(source_files)} source files (skipped {len(all_files) - len(source_files)} non-source files)")

        for i, file_path in enumerate(source_files):
            if i > 0 and i % 100 == 0:
                print(f"  ... parsed {i}/{len(source_files)} files, {len(dependencies)} deps found so far")
            try:
                content = self.github_client.get_file_content(owner, repo, file_path)
                imports = self._parse_imports(file_path, content)

                # Handle "from . import X" case: combine leading dots with subsequent items
                resolved_imports = []
                j = 0
                while j < len(imports):
                    imp = imports[j]
                    if imp == '.' or imp.startswith('.'):
                        if j + 1 < len(imports) and not imports[j + 1].startswith('.') and '/' not in imports[j + 1]:
                            combined = imp + imports[j + 1]
                            resolved_imports.append(combined)
                            j += 2
                        else:
                            resolved_imports.append(imp)
                            j += 1
                    else:
                        resolved_imports.append(imp)
                        j += 1

                for imp in resolved_imports:
                    candidates = []

                    if imp.startswith('.'):
                        base_dir = os.path.dirname(file_path)
                        clean_imp = imp.lstrip('.')
                        if clean_imp:
                            path_imp = clean_imp.replace('.', '/')
                            resolved = os.path.normpath(os.path.join(base_dir, path_imp))
                        else:
                            continue
                        candidates.append(resolved)
                    elif imp.startswith('@/'):
                        candidates.append(imp.replace('@/', 'src/'))
                        candidates.append(imp.replace('@/', 'frontend/src/'))
                        candidates.append(imp.replace('@/', 'backend/src/'))
                    else:
                        candidates.append(imp)

                    target_file = None
                    for candidate in candidates:
                        possible_targets = [
                            f"{candidate}.py", f"{candidate}.js",
                            f"{candidate}.jsx", f"{candidate}.ts",
                            f"{candidate}.tsx", f"{candidate}/__init__.py",
                            f"{candidate}/index.js", f"{candidate}/index.ts",
                            f"{candidate}/index.tsx", candidate,
                        ]
                        for target in possible_targets:
                            if target in file_set:
                                target_file = target
                                break
                        if target_file:
                            break

                    if target_file:
                        dependencies.append({"source": file_path, "target": target_file})

            except Exception as e:
                print(f"Error parsing imports for {file_path}: {e}")

        return dependencies

    def _parse_with_treesitter(self, content: str, lang: str) -> List[str]:
        """
        Parse imports using tree-sitter for accurate cross-language support.
        Falls back to regex-based parsing if tree-sitter is unavailable.
        """
        imports = []
        try:
            parser = _TS_PARSERS.get(lang)
            if not parser:
                return []
            tree = parser.parse(bytes(content, 'utf8'))
            imports = self._extract_imports_from_tree(tree.root_node, lang)
        except Exception:
            pass
        return imports

    def _extract_imports_from_tree(self, node, lang: str) -> List[str]:
        """Recursively extract import statements from tree-sitter AST."""
        imports = []

        if node.type in ('import_statement', 'import_from_statement'):
            if lang == 'python':
                for child in node.children:
                    if child.type == 'dotted_name':
                        imports.append(child.text.decode('utf8'))
                    elif child.type == 'relative_import':
                        # from .module or from ..module - use full relative_import text
                        rel_text = child.text.decode('utf8') if child.text else ''
                        if rel_text:
                            imports.append(rel_text)
                    elif child.type == 'import':
                        pass  # 'import' keyword, skip
                    elif child.type == 'from':
                        pass  # 'from' keyword, skip
            elif lang == 'javascript':
                for child in node.children:
                    if child.type == 'string':
                        val = child.text.decode('utf8').strip('"\'')
                        if val:
                            imports.append(val)

        # Recurse into children
        for child in node.children:
            imports.extend(self._extract_imports_from_tree(child, lang))

        return imports

    def _parse_python_imports_regex(self, content: str) -> List[str]:
        """Regex-based Python import parser (fallback)."""
        imports = []
        regex = r"^\s*(?:from\s+([\.\w*]+)\s+import\s+([\w\s,()*]+)|import\s+([\.\w, ]+))"
        for line in content.splitlines():
            match = re.match(regex, line)
            if match:
                module = match.group(1) or match.group(3)
                if module:
                    raw_modules = [m.strip() for m in module.split(',')]
                    for m in raw_modules:
                        if m.startswith('.'):
                            dots = 0
                            for char in m:
                                if char == '.':
                                    dots += 1
                                else:
                                    break
                            remainder = m[dots:]
                            path_part = remainder.replace('.', '/')
                            if dots == 1:
                                normalized = f"./{path_part}"
                            else:
                                normalized = "../" * (dots - 1) + path_part
                            if normalized.endswith('/'):
                                normalized = normalized.rstrip('/')
                            imports.append(normalized)
                        else:
                            imports.append(m.replace('.', '/'))
        return imports

    def _parse_js_imports_regex(self, content: str) -> List[str]:
        """Regex-based JS import parser (fallback)."""
        imports = []
        regex = r"import\s+(?:(?:\*\s+as\s+\w+)|(?:\{[^}]+\})|\w+)\s+from\s+['\"]([^'\"]+)['\"]|import\s+['\"]([^'\"]+)['\"]|import\((['\"])(.*?)\3\)"
        for match in re.finditer(regex, content):
            module = match.group(1) or match.group(2) or match.group(4)
            if module:
                imports.append(module)
        return imports
