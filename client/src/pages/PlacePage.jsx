import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BookingWidget from "../BookingWidget";

export default function PlacePage() {
    const { id } = useParams();
    const [place, setPlace] = useState(null);
    const [showallPhotos,setshowallPhotos] = useState(false);
    useEffect(() => {
        if (!id) {
            return;
        }

        axios.get(`/places/${id}`).then(response => {
            setPlace(response.data);
        }).catch(error => {
            console.error("Error fetching place:", error);
        });
    }, [id]);

    if (!place) return <div>Loading...</div>;
    
    if (showallPhotos) {
        return (
            <div className="absolute inset-0 bg-black text-white min-h-screen flex flex-col">
                <div className="p-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl mr-36 font-semibold">Photos of {place.title}</h2>
                        <button
                            onClick={() => setshowallPhotos(false)}
                            className="flex items-center gap-2 py-2 px-4 bg-white text-black rounded-xl shadow-md hover:bg-gray-200"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                            Close photos
                        </button>
                    </div>
                </div>
                <div className="flex-grow p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                    {place?.photos?.length > 0 &&
                        place.photos.map((photo, index) => (
                            <div key={index} className="relative">
                                <img
                                    className="w-full h-full object-cover rounded-lg shadow-lg"
                                    src={`http://localhost:4000/uploads/${photo}`}
                                    alt={`Photo ${index + 1}`}
                                />
                            </div>
                        ))}
                </div>
            </div>
        );
    }
    


    return (
<div className="mt-4 bg-gray-100 mx-auto max-w-6xl px-8 pt-8 rounded-lg shadow-lg">
    <h1 className="text-3xl font-bold">{place.title}</h1>
    <a
        className="flex gap-1 my-3 block font-semibold underline text-blue-500"
        target="_blank"
        rel="noopener noreferrer"
        href={'https://maps.google.com/?q=' + place.address}
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
        </svg>
        {place.address}
    </a>
    <div className="relative mt-6">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-[2fr_1fr] lg:grid-cols-[3fr_2fr] rounded-3xl overflow-hidden">
            <div>
                {place.photos?.[0] && (
                    <div>
                        <img onClick={() => setshowallPhotos(true)}
                            className="aspect-video object-cover cursor-pointer rounded-lg"
                            src={'http://localhost:4000/uploads/' + place.photos[0]}
                            alt=""
                        />
                    </div>
                )}
            </div>
            <div className="grid gap-4">
                {place.photos?.[1] && (
                    <img onClick={() => setshowallPhotos(true)}
                        className="aspect-video object-cover cursor-pointer rounded-lg"
                        src={'http://localhost:4000/uploads/' + place.photos[1]}
                        alt=""
                    />
                )}
                {place.photos?.[2] && (
                    <img onClick={() => setshowallPhotos(true)}
                        className="aspect-video object-cover cursor-pointer rounded-lg"
                        src={'http://localhost:4000/uploads/' + place.photos[2]}
                        alt=""
                    />
                )}
            </div>
        </div>

        <button
            onClick={() => setshowallPhotos(true)}
            className="absolute bottom-4 right-4 py-2 px-4 bg-white rounded-2xl shadow-lg shadow-gray-500 flex items-center gap-2"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
            </svg>
            Show more photos
        </button>
    </div>

    <div className="mt-8 gap-8 grid grid-cols-1 md:grid-cols-[2fr_1fr]">
        <div>
            <div className="my-8">
                <h2 className="font-semibold text-2xl">Description</h2>
                <p className="text-gray-700 mt-2">{place.description}</p>
        </div>
            Check_in : {place.checkIn} <br/>
            Check_out : {place.checkOut} <br/>
            Max number of guests : {place.maxGuests}

        </div>
        <div>
            <BookingWidget place={place}/>
        </div>
    </div>
        <div className="bg-white -mx-8 mt-4 px-8 py-8 border-t">
        <h2 className="font-semibold text-2xl">Extra Info</h2>
            <div className="mb-4 mt-1 text-sm text-gray-700 leading-5">{place.extraInfo}</div>
        </div>
        </div>


    );
}
