import { AppBar, Toolbar, makeStyles, Typography, Box } from '@material-ui/core'
import SearchBar from './SearchBar'
import withStyles from '@material-ui/styles/withStyles/withStyles';
import HeaderButtons from './HeaderButtons'
import {Link} from 'react-router-dom'
const useStyle = makeStyles({
    header: {
        background: '#2874f0',
        height: 55
    },
    logo: {
        width: 75
    },
    subUrl: {
        width: 10,
        marginLeft: 4,
        height: 10
    },
    container: {
        display: 'flex'           // arrange in one line
    },
    component: {
        marginLeft: '12%',
        lineHeight:0,
        textDecoration:'none',
        color:'#fff'

    },
    subHeading:{
        fontSize:10,
        fontStyle:'italic'
    }

})

const ToolBar=withStyles({
    root:{
        minHeight:55
    }
})(Toolbar);
const Header = () => {
    const classes = useStyle();
    const logoURL = 'https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/flipkart-plus_8d85f4.png';
    const subURL = 'https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/plus_aef861.png';
    return (
        <AppBar className={classes.header}>
            <ToolBar>
                <Link to='/' className={classes.component}>
                    <img src={logoURL} className={classes.logo} />
                    <Box className={classes.container}>
                        <Typography className={classes.subHeading}>Explore <Box component='span' style={{color:'#FFE500'}}>Plus</Box></Typography>
                        <img src={subURL} className={classes.subUrl} />
                    </Box>
                    
                </Link>
                <SearchBar />
                <HeaderButtons />
            </ToolBar>

        </AppBar>
    )
}


export default Header;