import PhotosUploader from "../PhotosUploader";
import Perks from "../Perks";
import { useEffect, useState } from "react";
import AccountNav from "../AccountNav";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";

export default function PlacesFormPage() {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState('');
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(100);
  const [redirect, setRedirect] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get('/places/' + id).then(response => {
      const { data } = response;
      setTitle(data.title || '');  // Set default value to empty string if undefined
      setAddress(data.address || '');  // Default empty string
      setAddedPhotos(data.photos || []);  // Default to an empty array
      setDescription(data.description || '');  // Default empty string
      setPerks(data.perks || []);  // Default to an empty array
      setExtraInfo(data.extraInfo || '');  // Default empty string
      setCheckIn(data.checkIn || '');  // Default empty string
      setCheckOut(data.checkOut || '');  // Default empty string
      setMaxGuests(data.maxGuests || 1);  // Default to 1
      setPrice(data.price || 100);  // Default to 100
    });
  }, [id]);

  function inputHeader(text) {
    return <h2 className="text-2xl mt-4">{text}</h2>;
  }

  function inputDescription(text) {
    return <p className="text-gray-500 text-sm">{text}</p>;
  }

  function preInput(header, description) {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  }

  async function savePlace(ev) {
    ev.preventDefault();
    const placeData = { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price };

    if (id) {
      await axios.put('/places', {
        id, ...placeData
      });
      setRedirect(true);
    } else {
      await axios.post('/places', {
        placeData
      });
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={'/account/places'} />;
  }

  return (
    <>
      <div>
        <AccountNav />

        <form onSubmit={savePlace}>
          {preInput('Title', 'Title for your place')}
          <input
            type="text"
            placeholder="Title, for example: My flat"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
          />
          {preInput('Address', 'Address for your place')}
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(ev) => setAddress(ev.target.value)}
          />
          {preInput('Photos', 'More = better')}
          <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
          {preInput('Description', 'Description of the place')}
          <textarea
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
          />
          {preInput('Perks', 'Select all the perks of your place')}
          <div className="grid mt-2 gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <Perks selected={perks} onChange={setPerks} />
          </div>
          {preInput('Extra Info', 'House rules, etc.')}
          <textarea
            value={extraInfo}
            onChange={(ev) => setExtraInfo(ev.target.value)}
          />
          {preInput('Check-in and Checkout time', 'Add check-in and out times')}
          <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="mt-2 -mb-1">Check-in time</h3>
              <input
                type="text"
                placeholder="14:00"
                value={checkIn}
                onChange={(ev) => setCheckIn(ev.target.value)}
              />
            </div>
            <div>
              <h3>Check-out time</h3>
              <input
                type="text"
                placeholder="11:00"
                value={checkOut}
                onChange={(ev) => setCheckOut(ev.target.value)}
              />
            </div>
            <div>
              <h3>Max number of guests</h3>
              <input
                type="number"
                value={maxGuests}
                onChange={(ev) => setMaxGuests(ev.target.value)}
              />
            </div>
            <div>
              <h3>Price per night</h3>
              <input
                type="number"
                value={price}
                onChange={(ev) => setPrice(ev.target.value)}
              />
            </div>
          </div>
          <div>
            <button className="primary my-4">Save</button>
          </div>
        </form>
      </div>
    </>
  );
}
