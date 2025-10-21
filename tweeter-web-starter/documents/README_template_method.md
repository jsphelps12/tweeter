Template Method — before & after

A. Roles and relationships (concrete mapping)

- Superclass (template): `PagedItemPresenter<T, U extends Service>`

  - Location: `src/presenter/PagedItemPresenter.ts`
  - Responsibilities (implemented in superclass):
    - `loadMoreItems(authToken, userAlias)` — template method that:
      - calls `getMoreItemsImplementation(authToken, userAlias)` (deferred)
      - updates `hasMoreItems` and `lastItem`
      - calls `view.addItems(newItems)`
      - wraps the operation in `doFailureReportingOperation(...)` (error reporting)
    - Holds pagination state: `lastItem`, `hasMoreItems`.

- Concrete subclasses (hooks/overrides): `FeedPresenter`, `StoryPresenter`, `FolloweePresenter`, `FollowerPresenter`

  - Locations: `src/presenter/FeedPresenter.ts`, `StoryPresenter.ts`, `FolloweePresenter.ts`, `FollowerPresenter.ts`
  - Responsibilities (deferred to subclasses):
    - `getMoreItemsImplementation(authToken, userAlias)` — perform the model call for the specific feature (feed, story, followees)
    - `itemDescription()` — provide a string for failure messages

- Collaborators:
  - `StatusService` / `FollowService` (model/service) — `src/model.service/*`
  - `PagedItemView` (view interface) — `src/presenter/PagedItemPresenter.ts`

B. How the template method reduced duplication (concrete)

- Before: each presenter implemented the same sequence:

  - call the right service method to fetch a page
  - update `hasMoreItems` and `lastItem`
  - append items to the view with `view.addItems(...)`
  - catch/report errors

  This led to repeated code across `FeedPresenter`, `StoryPresenter`, `FolloweePresenter`, etc.

- After (current design): `PagedItemPresenter.loadMoreItems(...)` implements that sequence once. Subclasses only provide:

  - `getMoreItemsImplementation(...)` to call the appropriate service API
  - `itemDescription()` for error messages

  Result: much less duplicate code, single place to fix paging logic, and consistent error handling.

Diagrams (see accompanying `template_before.puml` and `template_after.puml` in this folder).
