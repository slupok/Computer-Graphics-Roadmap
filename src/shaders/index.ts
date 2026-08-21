// Реестр шейдеров: любой .frag в этой папке автоматически попадает в ротацию.
// Заголовок берётся из строки «// title: ...», иначе — имя файла.

const modules = import.meta.glob('./*.frag', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface Shader {
  id: string;
  title: string;
  source: string;
}

export const shaders: Shader[] = Object.entries(modules)
  .map(([path, source]) => {
    const id = path.replace(/^\.\//, '').replace(/\.frag$/, '');
    const title = source.match(/^\s*\/\/\s*title:\s*(.+)$/m)?.[1].trim();
    return { id, title: title ?? id, source };
  })
  .sort((a, b) => a.id.localeCompare(b.id));
