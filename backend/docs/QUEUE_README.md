# Queue Manager Implementation

## Overview

The Queue Manager is a robust task queuing system built on top of Bull and Redis. It provides:

- **Asynchronous Task Processing**: Process browser automation tasks in the background
- **Priority Queue**: Tasks are processed based on priority levels
- **Automatic Retries**: Failed tasks are automatically retried with exponential backoff
- **Concurrency Control**: Limit the number of concurrent tasks
- **Monitoring**: Comprehensive metrics via Prometheus
- **Event-driven Architecture**: Real-time task status updates

## Architecture

### Components

1. **QueueManager** (`src/core/queue/QueueManager.ts`)
   - Core queue management class
   - Built on Bull queue library
   - Handles task lifecycle (add, cancel, retry, etc.)
   - Event emitter for queue events
   - Prometheus metrics integration

2. **TaskProcessor** (`src/core/queue/TaskProcessor.ts`)
   - Processes different task types
   - Routes tasks to appropriate services
   - Tracks task execution time
   - Records metrics for monitoring

3. **Queue Routes** (`src/api/rest/queue.route.ts`)
   - REST API endpoints for queue management
   - Zod validation for request schemas
   - Comprehensive error handling

### Task Flow

```
Client Request
    ↓
Queue API Endpoint
    ↓
QueueManager.addTask()
    ↓
Bull Queue (Redis)
    ↓
TaskProcessor.processTask()
    ↓
Service Layer (screenshot, pdf, content, scrape)
    ↓
Result/Error
    ↓
Queue Events & Metrics
```

## Features

### 1. Task Types

- `SCREENSHOT`: Capture webpage screenshots
- `PDF`: Generate PDFs from webpages
- `CONTENT`: Extract webpage content
- `SCRAPE`: Scrape data using CSS selectors
- `CUSTOM`: Execute custom task handlers

### 2. Priority Levels

| Priority | Value | Description |
|----------|-------|-------------|
| CRITICAL | 1 | Highest priority |
| HIGH | 2 | High priority |
| NORMAL | 5 | Default priority |
| LOW | 10 | Lowest priority |

### 3. Task Status

- `WAITING`: Queued, waiting to be processed
- `ACTIVE`: Currently being processed
- `COMPLETED`: Successfully finished
- `FAILED`: Failed after all retries
- `DELAYED`: Waiting for retry after failure

### 4. Automatic Retry

- Default: 3 attempts
- Backoff strategy: Exponential
- Initial delay: 2000ms
- Configurable per task

### 5. Concurrency Control

- Default: 5 concurrent tasks
- Configurable via environment variable
- Prevents system overload

### 6. Monitoring & Metrics

#### Prometheus Metrics

- `browser_autos_queue_tasks` (Gauge): Tasks by status
- `browser_autos_queue_length` (Gauge): Waiting tasks count
- `browser_autos_task_duration_seconds` (Histogram): Task execution time
- `browser_autos_task_total` (Counter): Total tasks processed

#### Health Check

Queue stats included in `/health` endpoint:

```json
{
  "queue": {
    "waiting": 5,
    "active": 2,
    "completed": 100,
    "failed": 3,
    "delayed": 1,
    "total": 111
  }
}
```

## API Endpoints

### Task Management

#### Add Task

```http
POST /queue/tasks
Content-Type: application/json

{
  "type": "SCREENSHOT",
  "url": "https://example.com",
  "priority": "NORMAL",
  "maxRetries": 3,
  "fullPage": true,
  "format": "png"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "taskId": "uuid-here",
    "type": "SCREENSHOT",
    "status": "WAITING",
    "priority": "NORMAL",
    "createdAt": "2025-10-11T10:00:00.000Z"
  }
}
```

#### Get Task

```http
GET /queue/tasks/:id
```

#### Cancel Task

```http
DELETE /queue/tasks/:id
```

#### Retry Task

```http
POST /queue/tasks/:id/retry
```

### Queue Management

#### Get Stats

```http
GET /queue/stats
```

#### Get Status

```http
GET /queue/status
```

#### List Tasks

```http
GET /queue/tasks?status=waiting
```

#### Pause Queue

```http
POST /queue/pause
```

#### Resume Queue

```http
POST /queue/resume
```

#### Clean Queue

```http
DELETE /queue/clean
```

## Configuration

### Environment Variables

```env
# Redis connection
REDIS_URL=redis://localhost:6379

# Queue settings
QUEUE_NAME=browser-tasks
QUEUE_MAX_CONCURRENT=5
QUEUE_TIMEOUT=120000
QUEUE_RETRIES=3
```

### Code Configuration

```typescript
// Initialize queue with custom settings
const queueManager = new QueueManager(
  'redis://localhost:6379',  // Redis URL
  10                          // Concurrency
);
```

## Events

The QueueManager emits the following events:

```typescript
// Task events
queueManager.on('task:added', (task) => { });
queueManager.on('task:started', (task) => { });
queueManager.on('task:completed', (task) => { });
queueManager.on('task:failed', (task) => { });
queueManager.on('task:cancelled', (data) => { });
queueManager.on('task:retried', (data) => { });
queueManager.on('task:progress', (data) => { });
queueManager.on('task:stalled', (data) => { });

// Queue events
queueManager.on('queue:paused', () => { });
queueManager.on('queue:resumed', () => { });
queueManager.on('queue:emptied', () => { });
queueManager.on('queue:cleaned', () => { });
queueManager.on('queue:error', (error) => { });
```

## Error Handling

### Graceful Degradation

If Redis is unavailable, the queue system fails gracefully:

```typescript
try {
  initializeQueue();
} catch (error) {
  logger.warn('Queue features disabled - Redis unavailable');
  // Server continues running without queue
}
```

### Task Failure Handling

1. Task fails
2. Automatic retry with exponential backoff
3. After max retries, task marked as FAILED
4. Error logged and metrics updated
5. `task:failed` event emitted

## Usage Examples

### Add Screenshot Task

```typescript
const task = await queueManager.addTask({
  type: TaskType.SCREENSHOT,
  url: 'https://example.com',
  priority: TaskPriority.HIGH,
  fullPage: true,
  format: 'png',
  quality: 90
});
```

### Add PDF Task with Custom Retry

```typescript
const task = await queueManager.addTask({
  type: TaskType.PDF,
  url: 'https://example.com',
  priority: TaskPriority.NORMAL,
  maxRetries: 5,
  backoff: {
    type: 'exponential',
    delay: 3000
  },
  landscape: true,
  printBackground: true
});
```

### Monitor Task Progress

```typescript
queueManager.on('task:progress', ({ id, progress }) => {
  console.log(`Task ${id}: ${progress}% complete`);
});

queueManager.on('task:completed', (task) => {
  console.log(`Task ${task.id} completed:`, task.result);
});

queueManager.on('task:failed', (task) => {
  console.error(`Task ${task.id} failed:`, task.error);
});
```

### Get Queue Statistics

```typescript
const stats = await queueManager.getStats();
console.log(`
  Waiting: ${stats.waiting}
  Active: ${stats.active}
  Completed: ${stats.completed}
  Failed: ${stats.failed}
  Total Processed: ${stats.totalProcessed}
`);
```

## Testing

See [QUEUE_TESTING.md](./QUEUE_TESTING.md) for comprehensive testing guide.

### Prerequisites

- Redis must be running
- Start Redis: `redis-server` or `brew services start redis`

### Basic Test

```bash
# Add a screenshot task
curl -X POST http://localhost:3001/queue/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SCREENSHOT",
    "url": "https://example.com",
    "priority": "NORMAL",
    "fullPage": true
  }'

# Check queue stats
curl http://localhost:3001/queue/stats

# List active tasks
curl http://localhost:3001/queue/tasks?status=active
```

## Deployment Considerations

### Production Setup

1. **Redis Configuration**
   - Use Redis Cluster for high availability
   - Configure persistence (RDB/AOF)
   - Set appropriate memory limits
   - Enable authentication

2. **Queue Configuration**
   - Adjust concurrency based on server resources
   - Configure rate limiting
   - Set appropriate timeout values
   - Monitor queue size

3. **Monitoring**
   - Set up Prometheus scraping
   - Create Grafana dashboards
   - Configure alerts for queue metrics
   - Monitor Redis health

### Docker Deployment

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  api:
    build: .
    environment:
      REDIS_URL: redis://redis:6379
      QUEUE_MAX_CONCURRENT: 10
    depends_on:
      - redis
```

## Troubleshooting

### Queue Not Processing Tasks

1. Check Redis connection: `redis-cli ping`
2. Verify queue status: `GET /queue/status`
3. Check for paused queue: `POST /queue/resume`
4. Review logs for errors

### Tasks Failing Repeatedly

1. Check task configuration
2. Review error messages in logs
3. Verify target URLs are accessible
4. Check browser pool availability
5. Review resource limits

### High Queue Size

1. Increase concurrency
2. Scale horizontally (multiple workers)
3. Optimize task processing time
4. Review and cancel stuck tasks

## Future Enhancements

- [ ] Bull Board UI for queue visualization
- [ ] Task scheduling (cron-like)
- [ ] Batch task operations
- [ ] Task dependencies
- [ ] Dead letter queue for permanently failed tasks
- [ ] Queue partitioning by task type
- [ ] Advanced priority algorithms
- [ ] Task result caching

## Related Files

- `src/core/queue/QueueManager.ts` - Queue manager implementation
- `src/core/queue/TaskProcessor.ts` - Task processor
- `src/core/queue/index.ts` - Queue initialization
- `src/api/rest/queue.route.ts` - REST API routes
- `src/types/queue.types.ts` - Type definitions
- `src/utils/metrics.ts` - Prometheus metrics
