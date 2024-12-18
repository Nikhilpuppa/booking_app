import { useContext, useEffect, useState } from "react";
import {differenceInCalendarDays} from "date-fns"
import axios from 'axios'
import {Navigate} from "react-router-dom";
import { UserContext } from "./UserContext.jsx";

export default function BookingWidget({place}){
    const [checkIn,setCheckIn]=useState('');
    const [checkOut,setCheckOut]=useState('');
    const [numberOfGuests,setNumberOfGuests]=useState(1);
    const [name,setName]=useState('');
    const [phone,setPhone]=useState('');
    const [redirect,setRedirect]=useState('');
    const {user}=useContext(UserContext);

    useEffect(()=>{
        if(user){
            setName(user.name);
        }
    },[user])

    let numberOfNights=0;
    if(checkIn && checkOut){
        numberOfNights=differenceInCalendarDays(new Date(checkOut),new Date(checkIn));
    }
    async function bookThisPlace() {
        try {
            // Send the booking request to the server
            const response = await axios.post(
                '/bookings',
                {
                    checkIn,
                    checkOut,
                    numberOfGuests,
                    name,
                    phone,
                    place: place._id,
                    price: numberOfNights * place.price,
                },
                { withCredentials: true } // Ensure cookies are sent with the request
            );
    
            // Extract booking ID from the response
            const bookingId = response.data._id;
    
            if (bookingId) {
                // Redirect to the booking details page
                setRedirect(`/account/bookings/${bookingId}`);
            } else {
                console.error('Booking ID not received in response:', response.data);
            }
        } catch (error) {
            // Log the error for debugging
            console.error('Error while booking the place:', error);
    
            // Display an alert or handle the error in the UI
            alert('There was an issue with the booking. Please try again later.');
        }
    }
    
    if(redirect){
        return <Navigate to={redirect}/>
    }
    return (
        <div className="bg-white shadow p-4 rounded-2xl">
        <div className="text-2xl text-center">
            Price : ${place.price} / per night
        </div>
        <div className="border rounded-2xl mt-4">
            <div className="flex">
                <div className="px-3 py-4 ">
                    <label>Check in:</label>
                    <input type="date" 
                    value={checkIn} 
                    onChange={ev => setCheckIn(ev.target.value)}></input> 
                </div>
                <div className="px-3 py-4 border-t">
                    <label>Check out:</label>
                    <input type="date" 
                    value={checkOut} 
                    onChange={ev => setCheckOut(ev.target.value)}></input>
                </div>
            </div>
            <div className="px-3 py-4 border-t">
                    <label>Number of guests:</label>
                    <input type="number" 
                    value={numberOfGuests} 
                    onChange={ev => setNumberOfGuests(ev.target.value)}></input>
            </div>
            {numberOfNights>0 && (
                <div className="px-3 py-4 border-t">
                    <label>Your full name:</label>
                    <input type="text"
                        value={name}
                        onChange={ev => setName(ev.target.value)}></input>
                    <label>Phonenumber:</label>
                    <input type="tel"
                        value={phone}
                        onChange={ev => setPhone(ev.target.value)}></input>
                </div>
            )}
        </div>
        <button onClick={bookThisPlace} className="primary mt-4">
            Book this place
            {numberOfNights>0 && (
                <span>${numberOfNights * place.price}</span>
            )}
        </button>
    </div>
    )
}