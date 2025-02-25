import * as Context from "@effect/data/Context"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Http from "@effect/platform-bun/HttpClient"
import { runMain } from "@effect/platform-bun/Runtime"
import type * as ParseResult from "@effect/schema/ParseResult"
import * as Schema from "@effect/schema/Schema"

class Todo extends Schema.Class({
  userId: Schema.number,
  id: Schema.number,
  title: Schema.string,
  completed: Schema.boolean
}) {}

const TodoWithoutId = Todo.schemaStruct().pipe(Schema.omit("id"))
type TodoWithoutId = Schema.To<typeof TodoWithoutId>

interface TodoService {
  readonly create: (
    _: TodoWithoutId
  ) => Effect.Effect<never, Http.error.HttpClientError | Http.body.BodyError | ParseResult.ParseError, Todo>
}
const TodoService = Context.Tag<TodoService>()

const makeTodoService = Effect.gen(function*(_) {
  const defaultClient = yield* _(Http.client.Client)
  const clientWithBaseUrl = defaultClient.pipe(
    Http.client.filterStatusOk,
    Http.client.mapRequest(Http.request.prependUrl("https://jsonplaceholder.typicode.com"))
  )
  const decodeTodo = Http.response.schemaBodyJson(Todo.schema())

  const addTodoWithoutIdBody = Http.request.schemaBody(TodoWithoutId)
  const create = (todo: TodoWithoutId) =>
    addTodoWithoutIdBody(
      Http.request.post("/todos"),
      todo
    ).pipe(
      Effect.flatMap(clientWithBaseUrl),
      Effect.flatMap(decodeTodo)
    )

  return TodoService.of({ create })
})

const TodoServiceLive = Layer.effect(TodoService, makeTodoService).pipe(
  Layer.use(Http.client.layer)
)

Effect.flatMap(
  TodoService,
  (todos) => todos.create({ userId: 1, title: "test", completed: false })
).pipe(
  Effect.tap(Effect.log),
  Effect.provideLayer(TodoServiceLive),
  Effect.tapErrorCause(Effect.logError),
  runMain
)
