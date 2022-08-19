import * as React from 'react' ;

import styled from 'styled-components';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    Divider,
    InputLabel,
    TextField,
    DialogActions,
} from '@mui/material' ;


import { loadStripe } from "@stripe/stripe-js";

import {
    Elements,
} from "@stripe/react-stripe-js";

import PaymentCheckOut from './PaymentCheckOut';
import { Button, FormControlGroup } from '../../shared/ui';
import Loading from 'react-loading-components' ;

import { createPaymentIntent } from '../../stripe/payment_api';

import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
    paper: {
        backgroundColor : 'white !important',
        border : 'none',
        borderRadius : '10px !important',
    }
})) ;

const stripePromise =  loadStripe(process.env.REACT_APP_STRIPE_PUB_KEY);

const PaymentModal = (props) => {
    const classes = useStyles() ;

    const {
        open, 
        handleClose,
        productInfo
    } = props ;

    const [clientSecret, setClientSecret] = React.useState(false) ;
    const [paymentId, setPaymentId] = React.useState(false) ;
    const [loading, setLoading] = React.useState(false) ;

    const [full_name, setFullName] = React.useState('') ;
    const [message, setMessage] = React.useState('') ;

    const appearance = {
        theme: 'stripe',

        variables: {
            colorPrimary: '#0570de',
            colorBackground: 'white',
            colorText: '#707070',
            colorDanger: '#df1b41',
            fontSizeBase : '20px',
            borderRadius: '4px',
        }
    };

    const options = {
        clientSecret,
        appearance,
    };


    const handlePay = async () => {
        setLoading(true) ;

        let data = {
            "amount" : Number(productInfo.price * 100).toFixed(),
            "currency"  : 'usd',
            "payment_method_types[]" : 'card',
            "metadata[created_at]" : new Date().getTime() ,
            "metadata[full_name]" : full_name,
            "metadata[message]" : message
        } ;
        
        let res = await createPaymentIntent(data) ;

        if(res) {
            setClientSecret(res.client_secret) ;
            setPaymentId(res.id) ;
        }

        setLoading(false) ;
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                classes ={{
                    paper : classes.paper
                }}
                hideBackdrop={false}
            >
                <DialogTitle>
                    You can pay with your debit card.
                </DialogTitle>
                <Divider />
                <DialogContent>
                    {(clientSecret && paymentId) ? <Elements options={options} stripe={stripePromise}>
                        <PaymentCheckOut
                            clientSecret={clientSecret}
                            id={paymentId}
                        />
                    </Elements> : <BuyerInfoDiv>
                        <FormControlGroup>
                            <InputLabel>Full Name</InputLabel>
                            <TextField 
                                value={full_name}
                                onChange={(e) => setFullName(e.target.value)}
                                size={'small'}
                            />
                        </FormControlGroup>
                        <FormControlGroup>
                            <InputLabel>Message</InputLabel>
                            <TextField 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                size={'small'}
                                rows={5}
                                multiline
                            />
                        </FormControlGroup>
                    </BuyerInfoDiv>}
                </DialogContent>
                {
                    (clientSecret && paymentId) ? <></> : <>
                        <Divider />
                        <DialogActions>
                            <Button
                                onClick={handlePay}
                                className={loading ? 'disabled' : ''}
                            >
                                {
                                    loading && <>
                                        <Loading type='oval' width={30} height={30} fill={'white'} />&nbsp;&nbsp;
                                    </>
                                } Next
                            </Button>
                        </DialogActions>
                    </>
                }
            </Dialog>
        </>
    )
}

export default PaymentModal ;

const BuyerInfoDiv = styled.div`
    display : flex ;
    flex-direction : column ;
    gap : 15px;
`