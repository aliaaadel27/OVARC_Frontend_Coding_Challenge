# OVARC TASK

## Tech Stack
- **Vite**: Fast build tool and dev server.
- **React Router**: Dynamic routing with code splitting.
- **Tailwind CSS**: Utility-first CSS framework.


## Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```  

## Features
1. **Shop Page**: 
   
   It has a list of cards containing the book cover page, title & author, and which stores this book is available in. The sell button should mark this as sold but keep the card on the page.

2. **Authors Page** 

   It has a simple list of authors and two CTAs to edit the name (in-line edit) or delete the author entirely. There is a CTA & a modal too for adding a new author.

3. **Books Page** 

   It has a list of books, the number of pages, and who the author is. The edit CTA is an in-line edit for the book title.

4. **Stores Page** 

   Same as the above two. The entire row is a CTA for the next page.

5. **Store Inventory Page**

   This is where the admin adds more books to the store’s
inventory. The books should be viewable either in a list view or grouped by the author via the tab selection. The add to inventory CTA pops up a modal to select the new book and set its price.

Future Roadmap: Making the Table More Flexible

-Current Setup:
Right now, the BooksTable is doing "double duty." It acts as a presentational component, but it also contains the business logic to decide what to edit—checking if it’s a Book Name (on the Catalog page) or a Book Price (on the Inventory page). While this works, it tightly couples the table to specific pages, making it harder to extend as the project grows.

-The Plan: Adopting the "Render Props Pattern"
I am planning to simplify the table by making it "dumb" (purely presentational). Instead of the table containing the editing logic, the parent pages will inject the specific Cell Renderers needed for each column via the Render Props Pattern.

-Why this approach?
   
      1-Decoupling Logic: The BooksTable will no longer care what it is displaying; its only job is to render the provided structures.
   
      2-True Reusability: By shifting the logic to parent pages, we can reuse this exact same table for any future entity without ever modifying the table's internal code.
   
      3-Maintenance: We achieve a clean "Separation of Concerns"—the Page acts as the "Brain" (handling logic and state), while the Table acts as the "Body" (handling layout and styling).

## Project Structure
- src/pages/: Contains page components like Home, BrowseStores, Browse, BrowseAuthors, and Inventory.

- src/components/: Includes reusable UI components such as StoreCard, BookCard, AuthorCard, BooksTable, Modal, and Header.

- src/hooks/: Custom hooks like useLibraryData for data fetching and state management.

- src/assets/: Stores static assets like author images (a1.png, a2.png).

- data/: JSON files (stores.json, books.json, authors.json, inventory.json) for mock data.

Routes
- /: Home page with sections for Stores, Books, and Authors.

- /browse-stores: Browse all stores with their book counts and average prices.

- /browse: Browse all books with their authors and store availability.

- /browse-authors: Browse all authors with their published book counts.


