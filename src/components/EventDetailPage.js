// src/components/EventDetailsPage.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { db } from '../firebase';

const EventDetailsPage = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      const eventRef = doc(db, 'events', id);
      const eventDoc = await getDoc(eventRef);

      if (eventDoc.exists()) {
        setEvent(eventDoc.data());
      } else {
        console.log('No such document!');
      }
    };

    fetchEventDetails();
  }, [id]);

  if (!event) return <div>Loading...</div>;

  return (
    <div className="p-8 font-poppins mt-16">
      <h1 className="text-3xl font-bold mb-4 text-dark">{event.title}</h1>
      <div className="flex space-x-1 items-center text-gray-600 text-sm mb-6">
        <FontAwesomeIcon icon={faCalendarAlt} className="w-5 h-5 mr-2 text-primary" />
        <span>{event.date} {event.time} am (IST) </span>
        <button
          onClick={() => window.location.href = '#calendar'}
          className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full shadow-md hover:bg-blue-600"
        >
          Add to Calendar
        </button>
      </div>
      <div className="flex items-center space-x-4 mb-4"> {/* Flex container for image and text */}
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-1/3 h-auto object-cover rounded-lg shadow-lg"  // Adjust width as needed
        />
        <div className="flex-1"> {/* Flex container for text */}
          <p className="text-dark mb-4">{event.description}</p>
          <p className="text-dark mb-4">
            For more details, reach us at <strong>{event.phone}</strong> or email at{' '}
            <a href={`mailto:${event.email1}`} className="text-red-600 underline hover:text-green-600">
              {event.email}
            </a>.
          </p>
        </div>
      </div>
      <div className="flex space-x-4 mb-4">
        {event.gformLink && (
          <button
            onClick={() => window.open(event.gformLink, '_blank')}
            className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
          >
            Fill out the Google Form
          </button>
        )}
      </div>
    </div>
  );
};

export default EventDetailsPage;
