# [Gogame](https://shket.space/gogame)
Веб приложение для игры в [**Го**](https://ru.wikipedia.org/wiki/%D0%93%D0%BE)

## Возможности
- Играть онлайн до 6 человек (в оригинальной игроков всегда 2)
- Запуска оффлайн партий
- Просмотр партий и их состояний в виде списка в реальном времени
- Наблюдение за игрой других людей

### Игровые особенности
- Возможность менять игровые настройки:
    - Размер поля
    - Количество игроков
    - Режим игры (классический, атари)
- Режим планирования ходов
- Подсветка дыханий груп камней при наведении курсором
- Индикация онлайн сотояния игроков

## Страницы
- Стартовая, с изменением игровых настроек и кнопками для создания и поиска игр
- Ожидания других игроков
- Игровое поле (для игры и наблюдения)
- Список всех партий и их сотояний с возможностью подключения и наблюдения

## Технологии
#### Backend
- Python 3.12
- FastAPI (async)
- SQLAlchemy 2 (async)
- Pydantic 2
- PostgreSQL 16
- Redis 7
#### Deployment
- Docker
- Docker Compose
- Uvicorn
- Nginx
- CI/CD: Github actions
#### Frontend
- Typescript 5
- React 18
- Redux (RTK)
- Vite

### Особенности реализации
- Сохранение игровой сессия и автоматическое переподключение при случайном разрыве соединения / закрытии браузера
- Нет регистрации, для авторизации при переподключении используется временный токен (сгенерированный для игрока в начале партии)
- Информация о игре удаляется при завершении партии, также чистятся связанные с ней игроки и наблюдатели
- Используется адаптивный дизайн (игровое поле, список игр)

#### Технические детали
- В качестве протокола для двустороннего real-time обмена используется WebSocket
- Используется собственная библиотека для игровой логики
- Для хранения информации о партии (для переподключения) на стороне клиента используется localStorage (библиотека redux-persist)
- На удаленном хосте серверная часть запущена в нескольких экземплярах:
    - Чтобы подключения по WebSocket могли взаимодействовать даже из разных воркеров, используется Redis PUB/SUB
- Nginx проксирует запросы на Uvicorn или Node.js в зависимости от URL запроса
- PostgreSQL, Redis, Uvicorn, Node.js на удаленном хосте запущены в разных контейнерах Docker, которые поднимаются через Docker Compose
- CI/CD: При изменениях в мастер-ветке происходит автоматическое подтягивание изменений на удаленном сервере (VPS), пересобираются и перезапускаются контейнеры

#### ОпТеМеЗаЦиИ
- На странице со списком игр применяется пагинация, уже запрошенные игры обновляются более легковесным запросом (только по *id*, без дополнительных фильтраций)
- Записи из таблицы игровых настроек переиспользуются для игр
- используется мемоизация тяжелых React-компонентов (*GameTiles*) на странице со списком игр
- кодировние строкового представления состояния партии - кодирование последовательности пустых ячеек
- быстрый алгоритм обхода соседних камней (*estimate_groups*) через BFS и множества (set)