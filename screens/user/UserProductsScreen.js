import React from 'react';
import { FlatList, Button, Platform, Alert, View, Text }  from 'react-native';
import { useSelector, useDispatch } from  'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import * as productActions from '../../store/actions/products';
import HeaderButton from '../../components/UI/HeaderButton';
import ProductItem from '../../components/shop/ProductItem';
import Colors from '../../constants/Colors';

const UserProductsScreen = props => {

    const dispatch = useDispatch();
    const userProducts = useSelector(state => state.products.userProducts);

    const editProductHandler = productId => {
        props.navigation.navigate('EditProduct', {productId: productId});
    }

    const deleteHandler = (id) => {
        Alert.alert("Are you sure?", "Do you really want to delete this item?", [
            {text: "No", style: "default"},
            {text: "Yes", style: "destructive", onPress: () => {
                dispatch(productActions.deleteProduct(id));
            } }
        ])
    }

    if(userProducts.length === 0) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text>No products available!</Text>
            </View>
        );
    }

    return (
        <FlatList 
            data={userProducts}
            keyExtractor={item => item.id}
            renderItem={itemData => 
            <ProductItem 
                image={itemData.item.imageUrl}
                title={itemData.item.title}
                price={itemData.item.price}
                onSelect={() => {
                    editProductHandler(itemData.item.id); 
                }}
            >
                <Button 
                    color={Colors.primary} 
                    title="Edit" 
                    onPress={() => {
                        editProductHandler(itemData.item.id); 
                    }} 
                ></Button>
                <Button 
                    color={Colors.primary} 
                    title="Delete"  
                    onPress={() => deleteHandler(itemData.item.id)} 
                  //  onPress={deleteHandler.bind(this, itemData.item.id)}
                ></Button>
            </ProductItem>}
        />
    )
}

UserProductsScreen.navigationOptions = navData =>  {
    return {
        headerTitle: 'My Products',
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
                                title="Add"
                                iconName={Platform.OS === 'android' ? 'md-create' : 'ios-create'}
                                onPress={() => {
                                    navData.navigation.navigate('EditProduct');
                                }}
                            />
                        </HeaderButtons>)
    }
}

export default UserProductsScreen;