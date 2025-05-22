import { useNavigate } from "react-router-dom";
import "./Success.css";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <div className="success-icon">✅</div>
      <h1 className="success-title">Payment Successful!</h1>
      <p className="success-message">
        Thank you for your annual membership. Your payment has been processed successfully.
      </p>
      <div className="success-buttons">
        <button onClick={() => navigate("/")} className="btn btn-primary">Go to Home</button>
        <button onClick={() => navigate("/profile")} className="btn btn-outline">Go to Profile</button>
        <button onClick={() => navigate("/events")} className="btn btn-outline">View Events</button>
      </div>
    </div>
  );
};

export default Success;
