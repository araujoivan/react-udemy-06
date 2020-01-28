import React from 'react';
import { ScrollView, View, Text, Image, Button, StyleSheet} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as cartActions from '../../store/actions/cart';

const ProductsDetaiScreen = props => {

    const productId = props.navigation.getParam('productId');

    const selectedProduct = useSelector(state => 
        state.products.availableProducts.find(product => product.id === productId)
    );

    const dispatch = useDispatch();

    //ScrollView for content with has limit
    return(
        <ScrollView>
            <Image style={styles.image} source={{uri: selectedProduct.imageUrl}}/>
            <View style={styles.actions}>
                <Button title="Add to Cart" onPress={() => {

                    dispatch(cartActions.addToCart(selectedProduct));

                }}/>
            </View>
            <Text  style={styles.price}>${selectedProduct.price.toFixed(2)}</Text>
            <Text  style={styles.description}>{selectedProduct.description}</Text>
        </ScrollView>
    )
}

ProductsDetaiScreen.navigationOptions = navData => {
    return {
        //here I have access to the navigation param set into ProductOverviewScreen
        headerTitle: navData.navigation.getParam('productTitle')
    }
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 300
    },

    actions: {
        marginVertical: 10,
        alignItems: 'center'
    },

    price: {
        fontSize: 20,
        color: '#888',
        textAlign: 'center',
        marginVertical: 20,
        fontFamily: 'open-sans-bold',
    },

    description: {
        fontFamily: 'open-sans',
        fontSize: 14,
        textAlign: 'center',
        marginHorizontal: 20
    }
})

export default ProductsDetaiScreen;