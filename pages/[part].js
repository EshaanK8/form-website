import Head from 'next/head'
import styles from '../styles/Part.module.css'
import {GraphQLClient, gql} from 'graphql-request';
import Link from 'next/link';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useEffect, useState, Fragment } from "react";

import { IconButton} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';



//Components
import Card from "../components/Card";


//GraphQL Data
const graphcms = new GraphQLClient('https://api-ca-central-1.graphcms.com/v2/cl4g4ujw70ytc01z65xgxbgmm/master');

const QUERY = gql `
{
  exercises(first: 36, locales: [en]) {
    id, 
    title,
    slug,
    part,
    content
    coverPhoto {
      url
    }
    localizations {
      id,
      title,
      slug,
      part,
      content,
      coverPhoto {
        url
      }
    }
  }
}
`

const SLUGLIST = gql`
  {
    bodyParts(locales: [en]) {
      slug,
      locale
      localizations {
        slug,
        locale
      }
    }
  }
`;

export async function getStaticPaths() {
  const { bodyParts } = await graphcms.request(SLUGLIST);
  return {
    paths: bodyParts.map((bodyPart) => ({ params: { part: bodyPart.slug } })),
    fallback: false,
  };
}

//Generate info from api calls
export async function getStaticProps({ params }) {
  const part = params.part; //The body part that this page displays
  const data = await graphcms.request(QUERY);
  const {exercises} = data;
  return {
    props: {
      exercises,
      part
    },
    revalidate: 30,
  };
}

let map = new Map([
  ['chest', '#EAD6CD'],
  ['legs', '#8096FE'],
  ['back', '#9BE0E3'],
  ['abs', '#9BE0E3'],
  ['arms', '#EAD6CD'],
  ['shoulders', '#8096FE']
]);

export default function Part({ exercises, part }) {

  const setToStorage = (key,value) => {
    if(typeof window !== 'undefined'){
         return window.localStorage.setItem(key,value)
    }
  }

  //State
  const [state, setState] = useState({right: false});
  const [alignment, setAlignment] = React.useState('en');
  const [cart, setCart] = useState([{
    title: "Bench Press", 
    slug: "bench-press", 
    id: "cl4g5iy0h19xn0du760zbt2st", 
    localizations: [
      {
        "id": "cl4g5iy0h19xn0du760zbt2st",
        "title": "Banc de Presse",
        "slug": "bench-press",
        "part": "poitrine",
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "coverPhoto": {
          "url": "https://media.graphassets.com/41MbYljzQfqbxuGlVOyR"
        }
      }
    ]
  }]);

  //Fetch cart and language data and set it
  useEffect(() => {
      const cart = window.localStorage.getItem("cart");
      const language = window.localStorage.getItem("language");

      setToStorage("cart", JSON.stringify(JSON.parse(cart)));
      setToStorage("language", language);

      setCart(JSON.parse(cart))
      setAlignment(language)
  }, []);


  //Add a workout to cart
  const addToCart = (product) => {
    //Only add if it is not already in the cart
    if (!(cart.filter(function(e) { return e.title === product.title; }).length > 0)) {
      setToStorage('cart', JSON.stringify([...cart, product]));
      setCart([...cart, product]);
    }
    console.log(cart);
    console.log(product.title);
    console.log(product.slug);
  }

  //Add a workout to cart
  const removeFromCart = (product) => {
    var myArray = cart.filter(function( obj ) {
      return obj.title !== product.title;
    });
    setToStorage('cart', JSON.stringify(myArray));
    setCart(myArray)
    console.log(myArray);
  }

  //Toggle the Drawer
  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  //List of Added Exercises
  const list = (anchor) => (
    <Box
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, true)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      {
        (alignment == "en")
          ? //ENGLISH
            <div>
              <h1 className={styles.listTitle}>Saved Exercises</h1>
              <Divider />
              {(cart) 
                ? <List>
                    {cart.map((exercise) => (
                          
                            <ListItem key={exercise.id} disablePadding>
                              <ListItemButton className={styles.listBtnContainer}>
                                  <div className={styles.listBtnNameContainer}>
                                    <Link href={`/exercises/${exercise.slug}`}>
                                      <h1 className={styles.listItem}>{exercise.title}</h1>
                                    </Link>
                                  </div>
                                  <div className={styles.listBtnDeleteContainer}>
                                    <IconButton aria-label="remove exercise" onClick={() => removeFromCart(exercise)}>
                                      <DeleteIcon className={styles.deleteIcon} sx={{ fontSize: "2rem" }}/>
                                    </IconButton>
                                  </div>
                              </ListItemButton>
                            </ListItem>
                          
                    ))}
                  </List>
                : <div></div>
              }
            </div>
          : //FRENCH
            <div>
              <h1 className={styles.listTitle}>Exercices Enregistrés</h1>
              <Divider />
              {(cart) 
                ? <List>
                    {cart.map((exercise) => (
                          
                            <ListItem key={exercise.id} disablePadding>
                              <ListItemButton className={styles.listBtnContainer}>
                                  <div className={styles.listBtnNameContainer}>
                                    <Link href={`/exercises/${exercise.slug}`}>
                                      <h1 className={styles.listItem}>{exercise.localizations[0].title}</h1>
                                    </Link>
                                  </div>
                                  <div className={styles.listBtnDeleteContainer}>
                                    <IconButton aria-label="remove exercise" onClick={() => removeFromCart(exercise)}>
                                      <DeleteIcon className={styles.deleteIcon} sx={{ fontSize: "2rem" }}/>
                                    </IconButton>
                                  </div>
                              </ListItemButton>
                            </ListItem>
                          
                    ))}
                  </List>
                : <div></div>
              }
            </div>
      }
    </Box>
  );

  //Capitalizes the 'part' title
  const capitalizeFirst = str => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  //Change Language
  const handleChange = (event,newAlignment) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      setToStorage("language", newAlignment)
    }
  };

  const toFrench = str => {
    if (str == "chest") return "poitrine"
    if (str == "legs") return "jambes"
    if (str == "abs") return "abdos"
    if (str == "arms") return "bras"
    if (str == "shoulders") return "épaules"
    if (str == "back") return "dos"

  }

  const theme = createTheme({
    palette: {
      primary: {
        light: '#757ce8',
        main: '#ffff',
        dark: '#002884',
        contrastText: '#fff',
      },
      secondary: {
        light: '#ff7961',
        main: '#f44336',
        dark: '#ba000d',
        contrastText: '#000',
      },
    },
  });
  

  


  //JSX
  return (
    <div className={styles.container}>
      {(alignment == "en") 
          ? //ENGLISH
          <div>
            <div className={styles.topBar}>
              <div className={styles.titleBox}>
                <Link href="/">
                  <IconButton aria-label="remove exercise">
                    <ArrowBackIcon className={styles.backIcon} sx={{ fontSize: "3rem" }}/>
                  </IconButton>
                </Link>
                <img src={`/${part}.png`} alt="" className={styles.partIcon}></img>
                <h1 className={styles.title}>{capitalizeFirst(part)}</h1>
              </div>
              <div className={styles.iconBox}>
                {(['right']).map((anchor) => (
                  <Fragment key={anchor}>
                    <IconButton aria-label="add exercise" className={styles.listBtn} onClick={toggleDrawer(anchor, true)}>
                      <FormatListBulletedIcon className={styles.listIcon} sx={{ fontSize: "3rem" }}/>
                    </IconButton>
                    <SwipeableDrawer
                      anchor={anchor}
                      open={state[anchor]}
                      onClose={toggleDrawer(anchor, false)}
                      onOpen={toggleDrawer(anchor, true)}
                      >
                      {list(anchor)}
                    </SwipeableDrawer>
                  </Fragment>
                ))}
              </div>
              <div className={styles.toggleBox}>
                <ThemeProvider theme={theme}>
                  <ToggleButtonGroup
                    color="primary"
                    value={alignment}
                    exclusive
                    onChange={handleChange}
                  >
                    <ToggleButton value="en">EN</ToggleButton>
                    <ToggleButton value="fr">FR</ToggleButton>
                  </ToggleButtonGroup>
                </ThemeProvider>
              </div>
            </div>
            {(exercises.filter((item) => {return item.part == part}))        
            ? <main className={styles.main}>
                {exercises.filter((item) => {return item.part == part}).map((exercise) => (
                  <Card
                    title={exercise.title}
                    author={exercise.author}
                    coverPhoto={exercise.coverPhoto}
                    key={exercise.id}
                    datePublished={exercise.datePublished}
                    slug={exercise.slug}
                    part={exercise.part}
                    addItem={addToCart}
                    color={map.get(exercise.part)}
                  />
                ))}
              </main>
            : <div></div>     
            }
          </div>

          : //FRENCH
          <div>
            <div className={styles.topBar}>
              <div className={styles.titleBox}>
                <Link href="/">
                  <IconButton aria-label="remove exercise">
                    <ArrowBackIcon className={styles.backIcon} sx={{ fontSize: "3rem" }}/>
                  </IconButton>
                </Link>
                <img src={`/${part}.png`} alt="" className={styles.partIcon}></img>
                <h1 className={styles.title}>{capitalizeFirst(toFrench(part))}</h1>
              </div>
              <div className={styles.iconBox}>
                {(['right']).map((anchor) => (
                  <Fragment key={anchor}>
                    <IconButton aria-label="add exercise" className={styles.listBtn} onClick={toggleDrawer(anchor, true)}>
                      <FormatListBulletedIcon className={styles.listIcon} sx={{ fontSize: "3rem" }}/>
                    </IconButton>
                    <SwipeableDrawer
                      anchor={anchor}
                      open={state[anchor]}
                      onClose={toggleDrawer(anchor, false)}
                      onOpen={toggleDrawer(anchor, true)}
                      >
                      {list(anchor)}
                    </SwipeableDrawer>
                  </Fragment>
                ))}
              </div>
              <div className={styles.toggleBox}>
                <ThemeProvider theme={theme}>
                  <ToggleButtonGroup
                    color= "primary"
                    value={alignment}
                    exclusive
                    onChange={handleChange}
                  >
                    <ToggleButton value="en">EN</ToggleButton>
                    <ToggleButton value="fr">FR</ToggleButton>
                  </ToggleButtonGroup>
                </ThemeProvider>
              </div>
            </div>
            {(exercises.filter((item) => {return item.part == part}))        
            ? <main className={styles.main}>
                {exercises.filter((item) => {return item.part == part}).map((exercise) => (
                  <Card
                    title={exercise.localizations[0].title}
                    coverPhoto={exercise.localizations[0].coverPhoto}
                    key={exercise.localizations[0].id}
                    slug={exercise.localizations[0].slug}
                    part={exercise.localizations[0].part}
                    addItem={addToCart}
                    color={map.get(exercise.part)}
                  />
                ))}
              </main>
            : <div></div>     
            }
          </div>
      }
    </div>
    
  );
}
