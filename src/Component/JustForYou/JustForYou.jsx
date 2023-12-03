import "./JustForYou.css";
import { loadStripe } from "@stripe/stripe-js";
import { Button, Col, Row } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { PulseLoader } from "react-spinners";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment/moment";
import Swal from "sweetalert2";

const publishableKey =
    "pk_test_51NEGeNGO16nc6gMPydwjPCMfVK7VSAJj5bqVJ1QDwytY7jarGEYbT6tQBZyTqgpY1c7o0UPYCHqUBEanvs1rZyoa00F2Fw14aY";

const JustForYou = () => {
    const stripePromise = loadStripe(publishableKey);
    const [isOrderProcessing, setIsOrderProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const location = useLocation();
    const [paymentInfo, setPaymentInfo] = useState({})
    const pdfRef = useRef();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');

    const cartItems = [{
        images: "https://i.imgur.com/xdbHo4E.png",
        name: "Women leather bag",
        price: 230
    }]

    function generateRandomId() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const idLength = 20;
        let randomId = '';
        for (let i = 0; i < idLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomId += characters.charAt(randomIndex);
        }

        return randomId;
    }

    // Example usage
    const randomId = generateRandomId();

    console.log(randomId);


    const handleSumbit = async (e) => {
        e.preventDefault();
        const from = e.target;
        const name = from?.name?.value;
        const email = from?.email?.value;
        const address = from?.address?.value;
        const metadata = { name, email, randomId, atTime: new Date(), address, ...cartItems }
        const createLineItems = cartItems.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    images: [item.images],
                    name: item.name,
                },
                unit_amount: item.price * 100,
            },
            quantity: 1,

        }));

        localStorage.setItem('card', JSON.stringify(metadata));
        const stripe = await stripePromise;

        try {
            const res = await fetch("https://receipt-payment.vercel.app/api/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(createLineItems),
            });

            const result = await res.json();
            console.log(result);
            setIsOrderProcessing(true);
            const { error } = await stripe.redirectToCheckout({
                sessionId: result.id,
            });
        } catch (e) {
            console.log(e);
        }


    }



    useEffect(() => {

        async function createFinal() {

            if (status === "success") {

                const storedData = localStorage.getItem('card');
                const parsedData = JSON.parse(storedData);
                console.log(parsedData);
                setPaymentInfo(parsedData)
                if (paymentInfo?.email) {
                    const res = await fetch('https://receipt-payment.vercel.app/payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json', // Fix the typo here
                        },
                        body: JSON.stringify(paymentInfo),
                    });

                    const result = await res.json();
                    if (result?.success) {

                        localStorage.removeItem('card')
                        setPaymentInfo({})
                        Swal.fire({
                            position: "top-center",
                            icon: "success",
                            title: "Payment Successfully Please check Your Email",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        navigate('https://payment-stript.vercel.app')
                    }
                    console.log(result);
                }


            }


        }

        createFinal();
    }, [status,paymentInfo])



    useEffect(() => {
        if (orderSuccess) {
            setTimeout(() => {
                setOrderSuccess(false);

            }, [2000]);
        }
    }, [orderSuccess]);





    if (paymentInfo?.email) {
        return <div>



            <div className="   resume    successPayment" ref={pdfRef}>

                <div className=" w-100">
                    <h1 className=" fs-1 p-3 fw-medium"> Receipt</h1>
                    <div className=" my-2 p-2">

                        <div className="   ">
                            <div>
                                <div className="   d-md-flex align-items-center gap-4">
                                    <h1 className=" fs-4   text-capitalize "> customer Name:  </h1> <h1 className=" fs-5 text-capitalize "> {paymentInfo?.name} </h1>
                                </div>
                                <div className="  d-md-flex align-items-center  gap-4 overflow-hidden">
                                    <h1 className=" fs-4  text-capitalize "> Payment Email:  </h1> <h1 className="    fs-5 "> {paymentInfo?.email} </h1>
                                </div>
                                <div className="  d-md-flex align-items-center  gap-4 ">
                                    <h1 className=" fs-4   text-capitalize "> transaction id:  </h1>   <h1 className=" fs-5 text-capitalize "> {paymentInfo?.randomId} </h1>
                                </div>
                                <div className="  d-md-flex align-items-center  gap-4">
                                    <h1 className=" fs-4   text-capitalize "> Paid Date:   </h1>    <h1 className=" fs-5 text-capitalize "> {moment(paymentInfo?.atTime).format('MMMM DD, YYYY')} </h1>
                                </div>
                            </div>
                        </div>

                        <div className="cardImage">
                            <img className=" w-100 h-100 object-fit-cover" src={paymentInfo?.[0]?.images} alt="" />
                        </div>


                    </div>
                    <h1 className=" fs-2  fw-medium text-capitalize"> ${paymentInfo?.[0]?.price}.00 paid on November 30 2023 </h1>


                    <table className=" w-100">
                        <thead className=" w-100">
                            <tr>
                                <th>Description</th>
                                <th>Qli</th>
                                <th>Unit Price</th>
                                <th>Amount</th>
                            </tr>

                        </thead>

                        <tbody className=" w-100">

                            <tr>
                                <td> <hr className=" hearClass " /></td>
                                <td> <hr className=" hearClass " /></td>
                                <td> <hr className=" hearClass " /></td>
                                <td> <hr className=" hearClass " /></td>


                            </tr>
                            <tr>

                                <td>{paymentInfo?.[0]?.name}</td>
                                <td>1</td>
                                <td>${paymentInfo?.[0]?.price}</td>
                                <td>${paymentInfo?.[0]?.price}</td>
                            </tr>

                        </tbody>
                    </table>
                    <h1 className=" fs-4  mt-4 fw-medium text-capitalize"> ${paymentInfo?.[0]?.price}.00 paid on November 30 2023 </h1>


                </div>
            </div>


        </div>
    }

    if (orderSuccess) {
        return (
            <section className="d-flex justify-content-center align-items-center w-100   h-25 mt-5 ">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">


                    <div className="px-4 py-6 sm:px-8 sm:py-10 flex flex-col gap-5">
                        <h1 className="font-bold text-lg">
                            Your payment is successfull and you will be redirected to
                            orders page in 2 seconds !
                        </h1>


                    </div>
                </div>
            </section>
        );
    }



    if (isOrderProcessing) {
        return (
            <div className="Loader">
                <div>
                    <PulseLoader
                        color={"#fff"}
                        loading={isOrderProcessing}
                        size={30}
                        data-testid="loader" />
                </div>

            </div>
        );
    }


    return (
        <div className="just_for_you py-5">
            <div className="container">
                <h2> Product </h2>


                <Row>
                    <Col xl="6">
                        <div className="product-card">
                            <div className="badge">Hot</div>
                            <div className="product-tumb">
                                <img src="https://i.imgur.com/xdbHo4E.png" alt="" />
                            </div>
                            <div className="product-details">
                                <span className="product-catagory">Women,bag</span>
                                <h4><a href="">Women leather bag</a></h4>
                                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vero, possimus nostrum!</p>
                                <div className="product-bottom-details">
                                    <div className="product-price"><small>$460.00</small>$230.00</div>
                                    <div className="product-links">
                                        <a href=""><i className="fa fa-heart"></i></a>
                                        <a href=""><i className="fa fa-shopping-cart"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xl="6">
                        <form className=" mt-4" onSubmit={handleSumbit} action="">

                            <h1>Enter Your info</h1>


                            <div className="form-group my-2">
                                <label for="exampleInputEmail1">Your Nmae</label>
                                <input required type="text" className="form-control mt-1" id="exampleInputEmail1" aria-describedby="emailHelp" name="name" placeholder="Ex: Shamim Hossain " />

                            </div>
                            <div className="form-group my-2">
                                <label for="exampleInputEmail1">Email address</label>
                                <input required type="email" className="form-control mt-1" id="exampleInputEmail1" aria-describedby="emailHelp" name="email" placeholder="Ex: example@gamil.com" />

                            </div>
                            <div className="form-group my-2">
                                <label for="exampleInputPassword1">Address</label>
                                <input required type="text" className="form-control mt-1" id="exampleInputPassword1" name="address" placeholder="Ex: Bogura Rajshahi" />
                            </div>


                            <div className=" mt-5">
                                <Button className="submitButton" type="submit" variant="" >
                                    Submit
                                </Button>
                            </div>

                        </form>
                    </Col>
                </Row>




            </div>
        </div>
    );
};

export default JustForYou;
