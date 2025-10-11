# Queue Manager Testing Guide

## Prerequisites

Queue Manager requires Redis to be running. Make sure Redis is installed and started:

```bash
# Install Redis (if not already installed)
# macOS
brew install redis

# Start Redis
redis-server

# Or start as a service
brew services start redis
```

## Queue API Endpoints

### 1. Add Task to Queue

```bash
POST /queue/tasks

# Example: Add screenshot task
curl -X POST http://localhost:3001/queue/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SCREENSHOT",
    "url": "https://example.com",
    "priority": "NORMAL",
    "fullPage": true,
    "format": "png"
  }'

# Example: Add PDF task
curl -X POST http://localhost:3001/queue/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PDF",
    "url": "https://example.com",
    "priority": "HIGH",
    "landscape": false,
    "printBackground": true
  }'
```

### 2. Get Task Status

```bash
GET /queue/tasks/:id

curl http://localhost:3001/queue/tasks/{taskId}
```

### 3. Get Queue Stats

```bash
GET /queue/stats

curl http://localhost:3001/queue/stats
```

### 4. Get Queue Status

```bash
GET /queue/status

curl http://localhost:3001/queue/status
```

### 5. List Tasks

```bash
GET /queue/tasks?status=waiting
GET /queue/tasks?status=active
GET /queue/tasks?status=failed

curl http://localhost:3001/queue/tasks?status=waiting
```

### 6. Cancel Task

```bash
DELETE /queue/tasks/:id

curl -X DELETE http://localhost:3001/queue/tasks/{taskId}
```

### 7. Retry Failed Task

```bash
POST /queue/tasks/:id/retry

curl -X POST http://localhost:3001/queue/tasks/{taskId}/retry
```

### 8. Pause Queue

```bash
POST /queue/pause

curl -X POST http://localhost:3001/queue/pause
```

### 9. Resume Queue

```bash
POST /queue/resume

curl -X POST http://localhost:3001/queue/resume
```

### 10. Clean Queue

```bash
DELETE /queue/clean

curl -X DELETE http://localhost:3001/queue/clean
```

## Task Types

- `SCREENSHOT` - Take screenshot of a webpage
- `PDF` - Generate PDF from a webpage
- `CONTENT` - Extract content from a webpage
- `SCRAPE` - Scrape data from a webpage using selectors
- `CUSTOM` - Custom task with handler

## Task Priorities

- `LOW` - Priority value: 10
- `NORMAL` - Priority value: 5 (default)
- `HIGH` - Priority value: 2
- `CRITICAL` - Priority value: 1

## Task Status

- `WAITING` - Task is waiting in queue
- `ACTIVE` - Task is currently being processed
- `COMPLETED` - Task finished successfully
- `FAILED` - Task failed after retries
- `DELAYED` - Task is delayed for retry

## Features

### Automatic Retry

Tasks automatically retry up to 3 times (configurable) with exponential backoff:
- Initial delay: 2000ms
- Backoff type: exponential

### Priority Queue

Tasks are processed based on priority (lower number = higher priority):
1. CRITICAL (1)
2. HIGH (2)
3. NORMAL (5)
4. LOW (10)

### Concurrency Control

- Default concurrency: 5 concurrent tasks
- Configurable via `QUEUE_MAX_CONCURRENT` environment variable

### Monitoring

Queue stats are available at:
- `/queue/stats` - Detailed queue statistics
- `/health` - Includes queue stats in health check
- `/metrics` - Prometheus metrics for queue

## Testing Without Redis

If Redis is not running, the queue system will fail to initialize but the server will continue running with other features available. Queue API endpoints will return errors when Redis is unavailable.

To test the full queue functionality, ensure Redis is running before starting the server.
