import { createContext, useContext, useReducer, useCallback } from "react";

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case "ADD_ITEM": {
            const existing = state.items.find(i => i.menu_item_id === action.payload.menu_item_id);
            if (existing) {
                return {
                    ...state,
                    items: state.items.map(i =>
                        i.menu_item_id === action.payload.menu_item_id
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    )
                };
            }
            return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
        }
        case "REMOVE_ITEM":
            return { ...state, items: state.items.filter(i => i.menu_item_id !== action.payload) };
        case "UPDATE_QUANTITY":
            if (action.payload.quantity <= 0) {
                return { ...state, items: state.items.filter(i => i.menu_item_id !== action.payload.menu_item_id) };
            }
            return {
                ...state,
                items: state.items.map(i =>
                    i.menu_item_id === action.payload.menu_item_id
                        ? { ...i, quantity: action.payload.quantity }
                        : i
                )
            };
        case "SET_TABLE":
            return { ...state, tableNumber: action.payload };
        case "CLEAR":
            return { ...state, items: [] };
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [], tableNumber: null });

    const addItem = useCallback((item) => dispatch({ type: "ADD_ITEM", payload: item }), []);
    const removeItem = useCallback((id) => dispatch({ type: "REMOVE_ITEM", payload: id }), []);
    const updateQuantity = useCallback((menu_item_id, quantity) =>
        dispatch({ type: "UPDATE_QUANTITY", payload: { menu_item_id, quantity } }), []);
    const setTable = useCallback((num) => dispatch({ type: "SET_TABLE", payload: num }), []);
    const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

    const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items: state.items,
            tableNumber: state.tableNumber,
            total,
            itemCount,
            addItem,
            removeItem,
            updateQuantity,
            setTable,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be within CartProvider");
    return ctx;
};
