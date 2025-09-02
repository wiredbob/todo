# API Specification

## REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Intelligent To-Do App API
  version: 1.0.0
  description: RESTful API for task management with intelligent breakdown
servers:
  - url: https://your-app.vercel.app/api
    description: Production API via Vercel Functions

paths:
  /tasks:
    get:
      summary: Get user tasks
      parameters:
        - name: context
          in: query
          schema:
            type: string
            enum: [work, personal]
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, in_progress, completed]
      responses:
        '200':
          description: List of tasks
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'
    
    post:
      summary: Create new task with intelligent breakdown
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                input:
                  type: string
                  description: Natural language task input
                context:
                  type: string
                  enum: [work, personal]
      responses:
        '201':
          description: Created task with breakdown
          content:
            application/json:
              schema:
                type: object
                properties:
                  parent_task:
                    $ref: '#/components/schemas/Task'
                  subtasks:
                    type: array
                    items:
                      $ref: '#/components/schemas/Task'

  /tasks/{id}:
    get:
      summary: Get specific task
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Task details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
    
    put:
      summary: Update task
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Task'
      responses:
        '200':
          description: Updated task
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
    
    delete:
      summary: Delete task
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Task deleted successfully

  /auth/login:
    post:
      summary: User authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        name:
          type: string
        created_at:
          type: string
    
    Task:
      type: object
      properties:
        id:
          type: string
        user_id:
          type: string
        parent_task_id:
          type: string
          nullable: true
        title:
          type: string
        description:
          type: string
          nullable: true
        due_date:
          type: string
          nullable: true
        priority:
          type: integer
        context:
          type: string
          enum: [work, personal]
        task_type:
          type: string
        status:
          type: string
          enum: [pending, in_progress, completed]
        breakdown_source:
          type: string
          enum: [manual, rule, ai]
        task_level:
          type: integer
        sequence_order:
          type: integer
        created_at:
          type: string
        updated_at:
          type: string
```
