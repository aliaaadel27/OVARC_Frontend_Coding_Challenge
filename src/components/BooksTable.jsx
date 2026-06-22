// src/components/BooksTable.jsx
import React, { useMemo } from 'react';
import Table from './Table/Table';
import TableActions from './ActionButton/TableActions';

const BooksTable = ({
  books,
  authors,
  editingRowId,
  setEditingRowId,
  editName,
  setEditName,
  setBooks,
  deleteBook,
  columnsConfig = ['id', 'name', 'pages', 'author', 'actions'], // Default columns
  onEditTrigger, // New prop: Custom callback to extract the correct field value for editing (e.g., price vs name)
}) => {
  // Create a lookup map for authors
  const authorMap = useMemo(() => {
    return authors.reduce((map, author) => {
      map[author.id] = `${author.first_name} ${author.last_name}`;
      return map;
    }, {});
  }, [authors]);

  // Enrich books with author names
  const enrichedBooks = useMemo(() => {
    return books.map((book) => ({
      ...book,
      author_name: authorMap[book.author_id] || 'Unknown Author',
    }));
  }, [books, authorMap]);

  // Define all possible columns
  const allColumns = useMemo(
    () => ({
      id: { header: 'Book Id', accessorKey: 'id' },
      name: {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) =>
          /* * REFACTORED: The name field becomes editable ONLY if setBooks is NOT provided.
           * This ensures the general Books page remains editable, while the Store Inventory page treats book names as read-only.
           */
          editingRowId === row.original.id && !setBooks ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave(row.original.id);
                if (e.key === 'Escape') handleCancel();
              }}
              className="border border-gray-300 rounded p-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            row.original.name
          ),
      },
      pages: { header: 'Pages', accessorKey: 'page_count' },
      author: { header: 'Author', accessorKey: 'author_name' },
      price: { 
        header: 'Price', 
        accessorKey: 'price',
        cell: ({ row }) =>
          /* * NEW FEATURE: Added inline editing capability for the Price column.
           * This triggers dynamically when a custom setBooks save handler is supplied from the parent component (Store Inventory).
           */
          editingRowId === row.original.id && setBooks ? (
            <input
              type="number"
              step="0.01"
              value={editName} // Reusing the state variable to hold the numerical price during active row edit
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setBooks(row.original.id); // Invokes the external parent handler with the Book ID
                if (e.key === 'Escape') handleCancel();
              }}
              className="border border-gray-300 rounded p-1 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <span>${row.original.price || '0.00'}</span>
          ),
      },
      actions: {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <TableActions
            row={row}
            onEdit={
              editingRowId === row.original.id
                ? handleCancel
                : () => handleEdit(row.original)
            }
            onDelete={() => deleteBook(row.original.id, row.original.name)}
          />
        ),
      },
    }),
    /* * BUG FIX: Added 'setBooks' to the dependencies array to prevent 
     * stale closures when switching save handlers between different parent views.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingRowId, editName, setBooks]
  );

  // Select columns based on columnsConfig
  const columns = useMemo(() => {
    return columnsConfig.map((colKey) => allColumns[colKey]).filter(Boolean);
  }, [columnsConfig, allColumns]);

  // Handle editing
  const handleEdit = (book) => {
    setEditingRowId(book.id);
    /* * REFACTORED: Decoupled edit state initialization from a fixed field ('name').
     * If an external 'onEditTrigger' callback is specified, it fetches the dynamic field (e.g., price); 
     * otherwise, it gracefully falls back to the default book name string.
     */
    if (onEditTrigger) {
      setEditName(onEditTrigger(book));
    } else {
      setEditName(book.name);
    }
  };

  // Save edited name (Legacy fallback handler for the main Books view)
  const handleSave = (id) => {
    setBooks(
      books.map((book) =>
        book.id === id ? { ...book, name: editName } : book
      )
    );
    setEditingRowId(null);
    setEditName('');
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingRowId(null);
    setEditName('');
  };

  return <Table data={enrichedBooks} columns={columns} />;
};

export default BooksTable;