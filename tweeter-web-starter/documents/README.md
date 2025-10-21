User Story — MVP design

This folder contains UML diagrams (ASCII and PlantUML) and a short explanation of the user story flow in the tweeter project (story page). The diagrams map the existing code in `src/presenter` and `src/model.service` and the `GenericItemScroller` view.

1. ASCII Class Diagram

   +----------------+ uses +------------------+
   | StoryPresenter|---------------------->| StatusService |
   |----------------| |------------------|
   | -isLoading | | +loadMoreStory...|
   | -hasMorePages | +------------------+
   | +loadStory(...)|
   +-------+--------+
   |
   | updates
   v
   +----------------+
   | PagedItemView|
   |----------------|
   | +addItems(...) |
   | +displayError..|
   +----------------+

2. ASCII Sequence Diagram (initial load)

   View -> Presenter: loadMoreItems(authToken, userAlias)
   Presenter -> View: displayLoading()
   Presenter -> StatusService: loadMoreStoryItems(authToken, userAlias, pageSize, lastItem)
   StatusService -> Fake Backend: HTTP GET /story?userAlias=...&limit=...
   Fake Backend --> StatusService: 200 {statuses, hasMorePages}
   StatusService --> Presenter: [statuses, hasMorePages]
   alt statuses.length > 0
   Presenter -> View: addItems(statuses)
   else
   Presenter -> View: (displayEmpty or do nothing)
   end

3. PlantUML files (class_diagram.puml and sequence_diagram.puml) are included for rendering with PlantUML.

Notes:

- These diagrams reflect current source files:
  - Presenter: `src/presenter/PagedItemPresenter.ts`, `StatusItemPresenter.ts`, `StoryPresenter.ts`
  - Service: `src/model.service/StatusService.ts`
  - View: `src/components/mainLayout/GenericItemScroller.tsx`
- If you want PNG/SVG exports, render the `.puml` files with PlantUML.
