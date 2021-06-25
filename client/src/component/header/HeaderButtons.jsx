import { Box, Button, makeStyles, Typography,Badge } from '@material-ui/core'
import { ShoppingCart } from '@material-ui/icons';
import {Link} from 'react-router-dom'
// import { ShoppingCartIcon } from '@material-ui/icons';
const useStyle = makeStyles({
    logIn: {
        background: '#FFFFFF',
        color: '#2874f0',
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 2,
        padding: '5px 40px',
        boxShadow:'none'

    },
    wrapper: {
        margin: '0 7% 0 auto',
        display: 'flex',
        alignItems: 'center',
        '& > *': {
            marginRight: 50,
            fontSize: 12,
            textDecoration:'none',
            color:'#fff'
        }
    },
    container:{
        display:'flex'
    }
})


const HeaderButtons = () => {
    const classes = useStyle();
    return (
        <Box className={classes.wrapper}>
            <Link><Button variant="contained" className={classes.logIn}>Login</Button></Link>
            <Link><Typography>More</Typography></Link>
            <Link to='/cart' className={classes.container}>
                <Badge badgeContent={4} color="secondary">
                    <ShoppingCart />
                </Badge>

                <Typography style={{ marginLeft:10}}>Cart</Typography>
            </Link>
        </Box>

    )
}


export default HeaderButtons;