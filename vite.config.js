import { defineConfig } from 'vite';
import { resolve, relative, extname } from 'path';
import { glob } from 'glob';

export default defineConfig({
  // base должен быть в корне объекта, а не внутри build
  base: './',

  build: {
    rollupOptions: {
      // Ищем все .html файлы в корне и во всех подпапках
      input: Object.fromEntries(
        glob.sync('**/*.html', { ignore: ['node_modules/**', 'dist/**'] }).map((file) => [
          // Относительный путь без расширения станет именем ключа
          relative('', file.slice(0, file.length - extname(file).length)),
          // Полный путь к файлу
          resolve(process.cwd(), file),
        ]),
      ),
    },
  },
});
