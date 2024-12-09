export default function Image({ src, ...rest }) {
  // Determine the base URL dynamically
  const baseURL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:4000/uploads/'
      : 'http://192.168.49.2:30001/uploads/'; // Update with your Minikube IP and port

  // If src is not a full URL, append the base URL
  const imageSrc = src && src.includes('https://') ? src : `${baseURL}${src}`;

  return <img {...rest} src={imageSrc} alt={''} />;
}
