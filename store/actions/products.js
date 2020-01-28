import Product from "../../models/product";

export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const SET_PRODUCT    = 'SET_PRODUCT';


export const fetchProduct = () => {
    
    return async (dispatch, getState) => {

        try {

            const userId = getState().auth.userId;

            const response = await fetch('https://udemy-react-12375.firebaseio.com/products.json');

            if(!response.ok) {
                throw new Error('Something went wrong!');
            }

            // blocked call
            const resData = await response.json();

            const loadedProducts = [];

            for(const key in resData) {
                loadedProducts.push(new Product(
                    key,
                    resData[key].owerId,
                    resData[key].title,
                    resData[key].imageUrl,
                    resData[key].description,
                    resData[key].price
                ));
            }

            dispatch({ 
                        type: SET_PRODUCT, 
                        products: loadedProducts,
                        userProducts: loadedProducts.filter(prod => prod.ownerId === userId)
                    });

        } catch(err) {
            throw err;
        }
    }
}

export const deleteProduct = productId => {

    return async (dispatch, getState) => {

        const token = getState().auth.token;

        const response = await fetch(
            `https://udemy-react-12375.firebaseio.com/products/${productId}.json?auth=${token}`,  { method: 'DELETE' }
        );

        if(!response.ok) {
            throw new Error('Something went wrong when trying to delete the product!');
        }

        dispatch({
            type: DELETE_PRODUCT,
            pid: productId
        });
    }
}

export const createProduct = (title, description, imageUrl, price)=> {
    // dispath is a function which is passed as paremeter by redux thunk
    return async (dispatch, getState) => {
        // any async code you want
 
        const token = getState().auth.token;
        const userId = getState().auth.userId;
        // you can use async instead of dealing with promises
        const response = await fetch(`https://udemy-react-12375.firebaseio.com/products.json?auth=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    title, 
                    description, 
                    imageUrl, 
                    price,
                    owerId: userId
                }
            )
        });

        // blocked call
        const resData = await response.json();

        dispatch({
            type: CREATE_PRODUCT,
            productData: {
                id: resData.name,
                title,
                description,
                imageUrl,
                price,
                owerId: userId
            }
        });
    }
};

export const updateProduct = (id, title, description, imageUrl)=> {
    // this second parameter 'getState' enable us to get access to all redux state variables
    return async (dispatch, getState) => {

        const token = getState().auth.token;

        const response = await fetch(
            `https://udemy-react-12375.firebaseio.com/products/${id}.json?auth=${token}`, 
            {
            //unlike PUT, PATCH updates just the parts you are declaring
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    title, 
                    description, 
                    imageUrl
                }
            )
        });

        if(!response.ok) {
            throw new Error('Something went wrong when trying to update the product!');
        }

        // this is kind of implicity then once you set  async before the dispatch return
        // and await to block until fetch return a response from server
        dispatch({
            type: UPDATE_PRODUCT,
            pid: id,
            productData: {
                title,
                description,
                imageUrl
            }  
        });
    };
};
