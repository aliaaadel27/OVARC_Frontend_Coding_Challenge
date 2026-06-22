import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useLibraryData from '../hooks/useLibraryData';
import BooksTable from '../components/BooksTable';
import Modal from '../components/Modal';
import Header from '../components/Header';
import Loading from './Loading';

const Inventory = () => {
  const { storeId } = useParams();
  const [searchParams] = useSearchParams();
  
  // Read search query directly from URL to sync with Header searchbar
  const searchTerm = searchParams.get('search') || '';

  // Fetch live store data based on URL params
  const { books, authors, inventory, setInventory, storeBooks, currentStore, isLoading } = 
    useLibraryData({ storeId, searchTerm });

  const [activeTab, setActiveTab] = useState('books');
  const [showModal, setShowModal] = useState(false);

  // Form & Inline editing states
  const [editingRowId, setEditingRowId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [newBookPrice, setNewBookPrice] = useState('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Controls custom autocomplete list

  // Sync active tab with 'view' query param
  useEffect(() => {
    const view = searchParams.get('view') || 'books';
    if (view === 'authors' || view === 'books') {
      setActiveTab(view);
    }
  }, [searchParams]);

  const openModal = () => setShowModal(true);

  // Reset form states on modal close
  const closeModal = () => {
    setShowModal(false);
    setSelectedBookId('');
    setNewBookPrice('');
    setBookSearchTerm('');
    setIsDropdownOpen(false);
  };

  // Save inline price edit
  const handleSavePrice = (bookId) => {
    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return alert('Valid price required');
    setInventory(prev => prev.map(item => item.store_id === parseInt(storeId, 10) && item.book_id === bookId ? { ...item, price: parsedPrice } : item));
    setEditingRowId(null);
    setEditPrice('');
  };

  // Remove book from current store inventory
  const handleDeleteBook = (bookId, bookName) => {
    if (window.confirm(`Remove "${bookName}"?`)) {
      setInventory(prev => prev.filter(item => !(item.store_id === parseInt(storeId, 10) && item.book_id === bookId)));
    }
  };

  // Filter books not in store, match search term, and limit to max 7 items
  const availableBooksForDropdown = useMemo(() => {
    const currentStoreBookIds = inventory.filter(item => item.store_id === parseInt(storeId, 10)).map(item => item.book_id);
    return books.filter(b => !currentStoreBookIds.includes(b.id) && b.name.toLowerCase().includes(bookSearchTerm.toLowerCase())).slice(0, 7);
  }, [books, inventory, storeId, bookSearchTerm]);

  // Add selected book and price to inventory
  const handleAddToInventory = () => {
    const price = parseFloat(newBookPrice);
    if (!selectedBookId || isNaN(price) || price <= 0) return alert('Valid book and price required');
    setInventory(prev => [...prev, { store_id: parseInt(storeId, 10), book_id: parseInt(selectedBookId, 10), price }]);
    closeModal();
  };

  if (isLoading) return <Loading />;

  return (
    <div className="py-6">
      <div className="flex mb-4 w-full justify-center items-center">
        <button onClick={() => setActiveTab('books')} className={`px-4 border-b-2 py-2 ${activeTab === 'books' ? 'border-b-blue-600' : 'border-b-transparent'}`}>Books</button>
        <button onClick={() => setActiveTab('authors')} className={`px-4 border-b-2 py-2 ${activeTab === 'authors' ? 'border-b-blue-600' : 'border-b-transparent'}`}>Authors</button>
      </div>

      <Header addNew={openModal} title={`${currentStore?.name || 'Store'} Inventory`} buttonTitle="Add to inventory" />

      {activeTab === 'books' ? (
        storeBooks.length > 0 ? (
            <BooksTable
              books={storeBooks}
              authors={authors}
              editingRowId={editingRowId}
              setEditingRowId={setEditingRowId}
              editName={editPrice}
              setEditName={setEditPrice}
              setBooks={handleSavePrice}
              deleteBook={handleDeleteBook}
              columnsConfig={['id', 'name', 'pages', 'author', 'price', 'actions']}
              onEditTrigger={(book) => book.price || ''}
            />
        ) : (
          <p className="text-gray-600">No books found in this store.</p>
        )
      ) : (
        <p className="text-gray-600">No authors with books in this store.</p>
      )}

      <Modal title="Add Book to Store" save={handleAddToInventory} cancel={closeModal} show={showModal} setShow={setShowModal}>
        <div className="flex flex-col gap-4 w-full min-h-[250px]"> 
          
          {/*Custom Searchable Combobox */}
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-1">Select Book</label>
            <input 
              type="text" 
              value={bookSearchTerm} 
              onFocus={() => setIsDropdownOpen(true)} 
              onChange={(e) => {
                setBookSearchTerm(e.target.value);
                setIsDropdownOpen(true);
                if(selectedBookId) setSelectedBookId('');
              }} 
              placeholder="Type to search book (e.g., Harry Potter)..." 
              className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
            />

            {isDropdownOpen && availableBooksForDropdown.length > 0 && (
              <ul className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-auto bg-white border border-gray-200 rounded shadow-lg text-sm">
                {availableBooksForDropdown.map((b) => (
                  <li 
                    key={b.id}
                    onClick={() => {
                      setSelectedBookId(b.id);
                      setBookSearchTerm(b.name);
                      setIsDropdownOpen(false);  
                    }}
                    className={`p-2.5 hover:bg-blue-50 cursor-pointer transition-colors ${selectedBookId === b.id ? 'bg-blue-100 font-medium text-blue-700' : 'text-gray-700'}`}
                  >
                    {b.name}
                  </li>
                ))}
              </ul>
            )}

            {isDropdownOpen && bookSearchTerm && availableBooksForDropdown.length === 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 p-3 bg-gray-50 border border-gray-200 rounded text-gray-500 text-sm italic">
                No available books match your search.
              </div>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-gray-700 font-medium mb-1">Price</label>
            <input id="price" type="number" step="0.01" value={newBookPrice} onChange={(e) => setNewBookPrice(e.target.value)} className="border border-gray-300 rounded p-2 w-full text-sm" placeholder="Enter Price (e.g., 19.99)" required />
          </div>

        </div>
      </Modal>
    </div>
  );
};

export default Inventory;