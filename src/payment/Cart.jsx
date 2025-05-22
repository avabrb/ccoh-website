import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { auth, db } from '../login/Login';
import './Cart.css';
import { doc, getDoc } from 'firebase/firestore';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISH);

const Cart = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async (currentUser) => {
            const userDoc = doc(db, 'users-ccoh', currentUser.uid);
            const docSnap = await getDoc(userDoc);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                console.log('Fetched Firestore user data:', userData); // Debugging: Log Firestore data
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                });
            } else {
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    firstName: '',
                    lastName: '',
                });
            }
        };

        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                fetchUserData(currentUser);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleCheckout = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('You must be signed in to proceed with payment.');
            return;
        }

        // Always fetch fresh user data from Firestore
        const userDoc = doc(db, 'users-ccoh', currentUser.uid);
        const docSnap = await getDoc(userDoc);
        const userData = docSnap.exists() ? docSnap.data() : {};

        const member = {
            uid: currentUser.uid,
            email: currentUser.email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
        };

        console.log("Fetched fresh member data before checkout:", member);

        if (!member.firstName || !member.lastName) {
            alert("Please complete your profile before proceeding to checkout.");
            return;
        }

        try {
            const stripe = await stripePromise;
            const response = await fetch(import.meta.env.VITE_FETCH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                cart: [{ options: { quantity: 1 } }], 
                member,
                successUrl: `${window.location.origin}/success`,
                cancelUrl: `${window.location.origin}/cancel`,
                }),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Failed to create Stripe checkout session: ${errorMessage}`);
            }

            const data = await response.json();

            if (data.sessionId) {
                const result = await stripe.redirectToCheckout({
                    sessionId: data.sessionId,
                });

                if (result.error) {
                    alert(result.error.message);
                }
            } else {
                alert('Failed to initiate Stripe checkout. Please try again.');
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('There was an error processing your checkout. Please try again.');
        }
    };
    
    // if (!user) {
    //     return <div>Please log in to view your cart.</div>;
    // }


    return (
        <div className="cart-container">
            <h1 className="cart-heading">Annual Membership</h1>
            <div className="cart-item">
                <div className="item-info">
                    <div className="item-name">Annual Membership Dues</div>
                    <div className="item-extra">$200.00 USD</div>
                </div>
            </div>
            <div className="cart-total">Total: $200.00</div>
            <button className="checkout-button" onClick={handleCheckout}>
                Proceed to Checkout
            </button>
        </div>
    );
};

export default Cart;