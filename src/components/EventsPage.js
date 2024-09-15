import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { FaPlusCircle, FaTrashAlt } from 'react-icons/fa';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);
  const [gformLink, setGformLink] = useState('');  // State for Google Form link

  const [workshops, setWorkshops] = useState([]);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [isAddingToWorkshops, setIsAddingToWorkshops] = useState(false);
  const [isRegisteringForEvent, setIsRegisteringForEvent] = useState(true);
  const [isRegisteringForWorkshop, setIsRegisteringForWorkshop] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [date, setDate] = useState('');
  const [email1, setEmail1] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState(''); // Determines where to add

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const eventCollection = await getDocs(collection(db, 'events'));
      const eventData = eventCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const workshopCollection = await getDocs(collection(db, 'workshops'));
      const workshopData = workshopCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWorkshops(workshopData);
    } catch (error) {
      console.error('Error fetching workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchWorkshops();
  }, []);

  const handleRegistration = async (e) => {
    e.preventDefault();

    try {
      if(isRegisteringForEvent){
        await addDoc(collection(db, 'registrations'), {
          name,
          email,
          event: selectedEvent,
          type:'event',
        });
      }else if(isRegisteringForWorkshop){
        await addDoc(collection(db, 'registrations'), {
          name,
          email,
          event: selectedEvent,
          type: 'workshop',
        });
      }
      alert('Registration Successful');
      setName('');
      setEmail('');
      setSelectedEvent('');
      sendEmailNotification(name, email, selectedEvent);
    } catch (error) {
      console.error('Error registering for event: ', error);
    }
  };
  // Handle adding new event or workshop
  const handleAddNewEventOrWorkshop = async (e) => {
    e.preventDefault();
    const newItem = {
      title: newTitle,
      description: newDescription,
      imageUrl: newImageUrl || 'https://via.placeholder.com/150', // Default image if none provided
      date,
      time,
      email:email1,
      phone,
      gformLink,
    };

    try {
      if (isAddingToWorkshops) {
        await addDoc(collection(db, 'workshops'), newItem);
        fetchWorkshops(); // Refresh workshops list
      } else {
        await addDoc(collection(db, 'events'), newItem);
        fetchEvents(); // Refresh events list
      }
      alert('Item added successfully');
      setShowAddEventForm(false); // Hide form after adding
      setNewTitle(''); // Clear form fields
      setNewDescription('');
      setNewImageUrl('');
      setDate('');
      setTime('');
      setEmail1('');
      setPhone('');
      await sendEmailNotification(newTitle, email1, newItem.title);
    } catch (error) {
      console.error('Error adding item: ', error);
    }
  };

  // Handle deleting an event or workshop
  const handleDeleteItem = async (id, isWorkshop) => {
    try {
      const docRef = doc(db, isWorkshop ? 'workshops' : 'events', id);
      await deleteDoc(docRef);
      alert('Item deleted successfully');
      if (isWorkshop) {
        fetchWorkshops(); // Refresh workshops
      } else {
        fetchEvents(); // Refresh events
      }
    } catch (error) {
      console.error('Error deleting item: ', error);
    }
  };

  const functions = getFunctions();

  const sendEmailNotification = async (name, email, event) => {
    try {
      const sendEmail = httpsCallable(functions, 'sendEmailNotification');
      await sendEmail({ name, email, event });
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
  return (
    <div className="font-poppins relative bg-cover bg-center" style={{ backgroundImage: "url('/events.jpg')" }}>
      <div className="relative z-10 p-8 text-center text-white">
        <h1 className="text-4xl font-bold mb-6">Events and Reunions</h1>
        <form onSubmit={handleRegistration} className="bg-white p-8 rounded-lg shadow-lg mx-auto max-w-md border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-700 mb-6">Register for an Event</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-left text-gray-700 font-semibold mb-1">Full Name*</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-black"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-left text-gray-700 font-semibold mb-1">E-Mail Address*</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-black"
              />
            </div>

            <div>
              <label htmlFor="registrationType" className="block text-left text-gray-700 font-semibold mb-1">Register for*</label>
              <select
                id="registrationType"
                value={isRegisteringForEvent ? 'event' : 'workshop'}
                onChange={(e) => {
                  const { value } = e.target;
                  if (value === 'event') {
                    setIsRegisteringForEvent(true);
                    setIsRegisteringForWorkshop(false);
                    setSelectedEvent('');
                  } else if (value === 'workshop') {
                    setIsRegisteringForEvent(false);
                    setIsRegisteringForWorkshop(true);
                    setSelectedEvent('');
                  }
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-black"
              >
                <option value="">Select Event or Workshop</option>
                <option value="event">Event</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>

            {isRegisteringForEvent && (
              <div>
                <label htmlFor="event" className="block text-left text-gray-700 font-semibold mb-1">Event*</label>
                <select
                  id="event"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-black"
                >
                  <option value="">Select an event</option>
                  {Array.isArray(events) && events.length > 0 ? (
                    events.map((event) => (
                      <option key={event.id} value={event.title}>
                        {event.title}
                      </option>
                    ))
                  ) : (
                    <option disabled>No events available</option>
                  )}
                </select>
              </div>
            )}

            {isRegisteringForWorkshop && (
              <div>
                <label htmlFor="workshop" className="block text-left text-gray-700 font-semibold mb-1">Workshop*</label>
                <select
                  id="workshop"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-black"
                >
                  <option value="">Select a workshop</option>
                  {Array.isArray(workshops) && workshops.length > 0 ? (
                    workshops.map((workshop) => (
                      <option key={workshop.id} value={workshop.title}>
                        {workshop.title}
                      </option>
                    ))
                  ) : (
                    <option disabled>No workshops available</option>
                  )}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 text-white font-semibold rounded-full bg-green-500 hover:bg-pink-500 shadow-lg transform hover:scale-105 transition duration-300"
            >
              Register Now
            </button>
          </div>
        </form>

        {/* Upcoming Events Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
          
          {loading ? (
            <p>Loading events...</p>
          ) : (
            <div className="flex flex-row space-x-6 overflow-x-auto">
              {events.map((event) => (
                <div key={event.id} className="relative group w-64 shrink-0">
                  <img src={event.imageUrl} alt={event.title} className="w-64 h-48 object-cover rounded-lg" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50">
                    <a href={`/events/${event.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                      Learn More
                    </a>
                    <FaTrashAlt 
                      className="ml-4 text-red-500 cursor-pointer"
                      onClick={() => handleDeleteItem(event.id, false)} // false = Not a workshop
                    />
                  </div>
                </div>
              ))}
              <FaPlusCircle 
                className="text-5xl text-green-500 cursor-pointer hover:text-green-700"
                onClick={() => {
                  setIsAddingToWorkshops(false); // Adding to events
                  setShowAddEventForm(true);
                }}
                style={{ alignSelf: 'center' }}
              />
            </div>
          )}
        </div>

        {/* Workshops Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Workshops</h2>
          
          <div className="flex flex-row space-x-6 overflow-x-auto">
            {/* Events */}
            <div className="relative group w-64 shrink-0">
              <img src="https://www.eurokidsindia.com/blog/wp-content/uploads/2023/12/national-tourism-day.jpg" alt="Event 1" className="w-64 h-48 object-cover rounded-lg" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50">
                <a href="/events/1" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                  Learn More
                </a>
              </div>
            </div>
            {workshops.map((workshop) => (
              <div key={workshop.id} className="relative group w-64 shrink-0">
                <img src={workshop.imageUrl} alt={workshop.title} className="w-64 h-48 object-cover rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50">
                  <a href={`/workshops/${workshop.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                    Learn More
                  </a>
                  <FaTrashAlt 
                    className="ml-4 text-red-500 cursor-pointer"
                    onClick={() => handleDeleteItem(workshop.id, true)} // true = Is a workshop
                  />
                </div>
              </div>
            ))}
            <FaPlusCircle 
              className="text-5xl text-green-500 cursor-pointer hover:text-green-700"
              onClick={() => {
                setIsAddingToWorkshops(true); // Adding to workshops
                setShowAddEventForm(true);
              }}
              style={{ alignSelf: 'center' }}
            />
          </div>
        </div>
      </div>

      {/* Add New Event/Workshop Form (Modal-like behavior) */}
      {showAddEventForm && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-20">
          <form onSubmit={handleAddNewEventOrWorkshop} className="relative max-h-screen w-full max-w-lg overflow-y-auto p-8 bg-white rounded-xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6">
              {isAddingToWorkshops ? 'Add New Workshop' : 'Add New Event'}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-left font-semibold mb-1">Title*</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div>
                <label className="block text-left font-semibold mb-1">Description*</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div>
                <label className="block text-left font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black"
                />
              </div>
              <div>
                <label htmlFor="gformLink" className="block text-left font-semibold mb-1">Google Form Link (optional)</label>
                <input
                  id="gformLink"
                  type="url"
                  value={gformLink}
                  onChange={(e) => setGformLink(e.target.value)}
                  placeholder="Enter Google Form link"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-left text-gray-700 font-semibold mb-1">Date*</label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-black"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-left text-gray-700 font-semibold mb-1">Time*</label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-black"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-left text-gray-700 font-semibold mb-1">Contact Email*</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter contact email"
                  value={email1}
                  onChange={(e) => setEmail1(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-black"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-left text-gray-700 font-semibold mb-1">Contact Phone*</label>
                <input
                  id="phone"
                  type="text"
                  placeholder="Enter contact phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-black"
                />
              </div>



              <div className="flex justify-between">
                <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded-md">
                  Add {isAddingToWorkshops ? 'Workshop' : 'Event'}
                </button>
                <button
                  type="button"
                  className="px-6 py-2 bg-red-500 text-white rounded-md"
                  onClick={() => setShowAddEventForm(false)} // Close form
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
