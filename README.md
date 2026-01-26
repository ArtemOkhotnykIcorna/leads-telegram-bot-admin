# Leads Admin Panel

Админ-панель для управления лидами Telegram бота.

## Технологии

- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- TanStack Query 5
- Zustand 4
- React Hook Form + Zod
- React Router 6
- Recharts

## Установка

```bash
# Установка зависимостей
npm install

# Копирование конфигурации
cp .env.example .env

# Запуск в режиме разработки
npm run dev

# Сборка
npm run build

# Предпросмотр сборки
npm run preview
```

## Структура проекта

```
src/
├── api/          # API слой (axios, endpoints)
├── components/
│   ├── ui/       # Базовые UI компоненты
│   ├── shared/   # Переиспользуемые компоненты
│   └── layout/   # Компоненты разметки
├── features/     # Модули по фичам
├── hooks/        # Кастомные хуки
├── lib/          # Утилиты и хелперы
├── router/       # Конфигурация маршрутов
├── store/        # Zustand stores
└── types/        # TypeScript типы
```

## Переменные окружения

| Переменная      | Описание            | По умолчанию                |
| --------------- | ------------------- | --------------------------- |
| `VITE_API_URL`  | URL API сервера     | `http://localhost:3000/api` |
| `VITE_APP_NAME` | Название приложения | `Leads Admin Panel`         |

## Доступные команды

- `npm run dev` - Запуск dev сервера
- `npm run build` - Сборка для production
- `npm run preview` - Предпросмотр сборки
- `npm run lint` - Проверка ESLint
- `npm run type-check` - Проверка TypeScript
