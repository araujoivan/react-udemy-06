import React, { useEffect, useState, useCallback } from  'react';
import { FlatList, Button, Platform, ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import ProductItem from '../../components/shop/ProductItem';
import * as cardActions from '../../store/actions/cart';
import * as productActions from '../../store/actions/products';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import Colors from '../../constants/Colors';
import HeaderButton from '../../components/UI/HeaderButton';

const ProductOverviewScreen = props => {

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadind, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // state.products <- this key is defined int the App.js rootReducer
    // products.availableproducts <- this key is defined in the reducers\product.js initialState
    const products = useSelector(state => state.products.availableProducts);

    const dispatch = useDispatch();

    // when you put async in front a method this automatically returns a promise
    const loadProducts = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(productActions.fetchProduct()); //await really awaits for the promise resolve or reject
        } catch(err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsRefreshing, setError]);

    // get data from server when componet is loaded
    useEffect(() => {
        setIsLoading(true);
        loadProducts().then(() => setIsLoading(false))   
    }, [dispatch, loadProducts]);

    useEffect(() => {
        const willFocusSub = props.navigation.addListener('willFocus', loadProducts);
        
        // runs when component is destroyed
        return () => {
            willFocusSub.remove();
        };

    }, [loadProducts]);

    const selectItemHandler = (id, title) => {
        props.navigation.navigate('ProductDetail', {
            productId: id,
            productTitle: title
        })
    } 

    if(error) {
        return <View  style={ styles.centered }>
                    <Text>An server error ocurred!</Text>
                    <Button
                        title='Try again'
                        onPress={loadProducts}
                        color={Colors.primary}
                    />
               </View>
    }

    if(isLoadind) {
        return <View style={ styles.centered }>
                    <ActivityIndicator 
                        size='large'
                        color={Colors.primary}
                    />
                </View>
    }

    if(!isLoadind && products.length === 0) {
        return <View  style={ styles.centered }>
                    <Text>No Products on the server!</Text>
               </View>
    }

    return (<FlatList 
                keyExtractor={item => item.id} 
                onRefresh={loadProducts}  // this both parameters gives that loading behaviour in the list
                refreshing={isRefreshing} // when the user hold and scroll the list
                data={products} 
                renderItem={itemData => 
                <ProductItem
                    image={itemData.item.imageUrl}
                    title={itemData.item.title}
                    price={itemData.item.price}
                    onSelect={() => selectItemHandler(itemData.item.id, itemData.item.title)}
                >
                    <Button 
                        color={Colors.primary} 
                        title="View Details" 
                        onPress={() => {
                            selectItemHandler(itemData.item.id, itemData.item.title);
                        }} 
                    ></Button>
                    <Button 
                        color={Colors.primary} 
                        title="To Cart"  
                        onPress={() => {
                            dispatch(cardActions.addToCart(itemData.item))
                        }} 
                    ></Button>
                </ProductItem>}
            />);
}

ProductOverviewScreen.navigationOptions = navData =>  {
    return {
        headerTitle: 'Products',
        headerLeft: () => (<HeaderButtons HeaderButtonComponent={HeaderButton}>
                        <Item
                            title="Menu"
                            iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
                            onPress={() => {
                                navData.navigation.toggleDrawer();
                            }}
                        />
                     </HeaderButtons>),
        headerRight: () => (<HeaderButtons HeaderButtonComponent={HeaderButton}>
                        <Item
                            title="Cart"
                            iconName={Platform.OS === 'android' ? 'md-cart' : 'ios-card'}
                            onPress={() => {
                                navData.navigation.navigate('Cart');
                            }}
                        />
                     </HeaderButtons>)
    }
}

const styles = StyleSheet.create({
    centered: {
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default ProductOverviewScreen