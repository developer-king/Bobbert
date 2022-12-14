import * as React from 'react' ;

import {connect} from 'react-redux' ;
import PropTypes from 'prop-types' ;
import { OrdersList, ProductsList , DeleteOrder} from '../../redux/actions/products';

import styled from 'styled-components';

import CancelIcon from '@mui/icons-material/Cancel';

import swal from 'sweetalert' ;
import { Button } from '../../shared/ui';

import PaymentModal from './PaymentModal';
import { useLocalStorage } from 'react-use';

import SearchOffIcon from '@mui/icons-material/SearchOff';

const Orders = (props) => {

    const {
        searchStr,

        OrdersList,
        ProductsList,
        DeleteOrder,

        ordersList,
    } = props ;

    const [productInfo, setProductInfo] = React.useState(null) ;
    const [products_of_custom, setCustomProducts] = useLocalStorage('products', {raw : false}) ;
    
    const [open, setOpen] = React.useState(false) ;

    const handleClose = () => {
        setOpen(false) ;
    }

    const handleDeleteOrder = async (id, method=null) => {
        if(await swal({
            title : 'Confirm',
            text : 'Are you sure that you want to delete this order?',
            buttons: [
                'No, I am not sure!',
                'Yes, I am sure!'
            ],
            icon : 'info'
        })) { 
            if(method) {
                await DeleteOrder(id) ;

                ProductsList() ;
                OrdersList() ;
            } else {
                let temp = {...products_of_custom} ;

                temp[id] = {
                    ...temp[id],
                    ordered :false
                }

                setCustomProducts(temp) ;

                window.location.reload() ;
            }
        }
    }

    const handlePayWithCard = async (order, method=null) => {
        if(method) {
            await DeleteOrder(order.id) ;

            await ProductsList() ;
            await OrdersList() ;
            setProductInfo({
                ...order,
                type : 'cloud'
            }) ;

        } else {
            let temp = {...products_of_custom} ;

            temp[order.id] = {
                ...temp[order.id],
                ordered : false 
            }

            setCustomProducts({...temp}) ;
            
            setProductInfo({
                ...order,
                type : 'custom',
            }) ;
        }

        setOpen(true) ;
    }

    return (
        <List>
            {
                ordersList.filter(order => 
                    order.name?.toLowerCase().search(searchStr?.toLowerCase()) >= 0 ||
                    order.description?.toLowerCase().search(searchStr?.toLowerCase()) >= 0
                ).map(order => (
                    <ListItem key={order.id}>
                        <InfoDiv>
                            <ImgDiv>
                                {<img src={order.image} alt='no product'/>}
                            </ImgDiv>
                            <div>
                                <NameDiv>
                                    {order.name}
                                </NameDiv>
                                <DescriptionDiv>
                                    {order.description}
                                </DescriptionDiv>
                            </div>
                        </InfoDiv>
                        
                        <EndDiv>
                            <PriceDiv>
                                ${order.price}
                            </PriceDiv>
                            <Button
                                onClick={() => handlePayWithCard(order, true)}
                            >
                                Buy
                            </Button>
                        </EndDiv>
                        <CloseIconDiv>
                            <CancelIcon 
                                onClick={() => handleDeleteOrder(order.id, true)}
                            />
                        </CloseIconDiv>
                    </ListItem>
                ))
            }
            {
                Object.entries(products_of_custom).filter(([id, product]) =>
                    product.ordered === true
                ).filter(([id, product]) => 
                    product.name?.toLowerCase().search(searchStr?.toLowerCase()) >= 0 ||
                    product.description?.toLowerCase().search(searchStr?.toLowerCase()) >= 0 
                ).map(([id, order]) => (
                    <ListItem key={id}>
                        <InfoDiv>
                            <ImgDiv>
                                {<img src={order.image} alt='no product'/>}
                            </ImgDiv>
                            <div>
                                <NameDiv>
                                    {order.name}
                                </NameDiv>
                                <DescriptionDiv>
                                    {order.description}
                                </DescriptionDiv>
                            </div>
                        </InfoDiv>
                        
                        <EndDiv>
                            <PriceDiv>
                                ${order.price}
                            </PriceDiv>
                            <Button
                                onClick={() => handlePayWithCard({
                                    ...order,
                                    id : id
                                })}
                            >
                                Buy
                            </Button>
                        </EndDiv>
                        <CloseIconDiv>
                            <CancelIcon 
                                onClick={() => handleDeleteOrder(id)}
                            />
                        </CloseIconDiv>
                    </ListItem>
                ))
            }
            {
                !ordersList.length && !Object.entries(products_of_custom).filter(([id, product]) =>
                    product.ordered === true
                ).length && <EmptyDiv>
                    <SearchOffIcon />
                    <div>
                        Cart is empty.
                    </div>
                </EmptyDiv>
            }
            <PaymentModal 
                open={open}
                handleClose={handleClose}
                productInfo={productInfo}
            />
        </List>
    )
}
Orders.propTypes = {
    OrdersList : PropTypes.func.isRequired,
    ProductsList: PropTypes.func.isRequired,
    DeleteOrder : PropTypes.func.isRequired
}
const mapDispatchToProps = {
    OrdersList,
    ProductsList,
    DeleteOrder
}
const mapStateToProps = state => ({
    ordersList : state.products.ordersList,
})
export default connect(mapStateToProps, mapDispatchToProps)(Orders) ;

const List = styled.div`
   width : 100% ;
   color : #707070 ;

   display : flex ;
   flex-direction : column ;
   gap : 20px;

   margin-bottom : 20px;
`
const ListItem = styled.div`
    position : relative ;
    background : white ;
    width : 100%;
    padding : 10px 20px 10px 25px;
    border-radius : 20px;

    display : flex ;
    justify-content : space-between ;
    align-items : flex-end ;

    @media screen and (max-width: 635px) {
        flex-direction : column ;
        justify-content : center ;
        align-items : center;

        gap : 20px;

        padding-top : 20px;
    }

    @media screen and (max-width: 380px) {
        padding-top : 50px;
    }
`
const InfoDiv = styled.div`
    display : flex ;
    gap : 10px;
    align-items : flex-end ;

    @media screen and (max-width: 380px) {
        flex-direction : column ;
        justify-content : center ;
        align-items : center;

        width : 100% ;
    }
`

const PriceDiv = styled.div`
    font-weight : 700;
    font-size : 25px;
`
const ImgDiv = styled.div`
    width : 150px;
    height : 150px;
    border-radius : 20px;
    background : #835959;

    & img {
        width : 100%;
        height : 100%;
        border-radius : 20px;
    }
    @media screen and (max-width: 380px) {
        width : 100% ;
    }
`
const NameDiv = styled.div`
    font-size : 17px;
`

const DescriptionDiv = styled.div`
    font-size : 20px ;
    font-weight : 700 ;
`

const EndDiv = styled.div`
    display : flex ;
    align-items : center ;
    gap : 30px ;

    @media screen and (max-width: 380px) {
        flex-direction : column ;
        gap : 10px;
    }
`

const CloseIconDiv = styled.div`
    position : absolute ;

    right : 10px ;
    top : 10px;

    & svg {
        transition : 0.2s ;

        color : #b92626 ;
        font-size : 40px;
        cursor : pointer;

        &:hover {
            color : red ;
        }
    }
`

const EmptyDiv = styled.div`
    background : white ;
    width : 100%;
    padding : 10px 20px 10px 25px;
    border-radius : 20px;

    height : 100px;

    font-size : 25px;
    font-weight : bold ;

    display : flex ;
    justify-content : center ;
    align-items : center ;
    flex-direction : column ;

    & svg {
        font-size : 40px;
    }
`