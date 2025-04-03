export default function handleBoatAction(id, e) {
    e.stopPropagation();
    fetch(`http://localhost:5001/boats/${id}`)
        .then((res) => res.json())
        .then((data) => console.log("Dettagli barca:", data))
        .catch((err) => console.error(err));
}
