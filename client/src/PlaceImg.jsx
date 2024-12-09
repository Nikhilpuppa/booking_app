export default function PlaceImg({ place, index = 0, className = null }) {
  if (!place?.photos?.length) {
    return '';
  }

  if (!className) {
    className = 'object-cover';
  }

  return (
    <img
      className={className}
      src={`${window.location.hostname === 'localhost' 
        ? 'http://localhost:4000/uploads/' 
        : 'http://192.168.49.2:30001/uploads/'}${place.photos[index]}`}
      alt=""
    />
  );
}
