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


//Components
import Card from "../components/Card";


//GraphQL Data
const graphcms = new GraphQLClient('https://api-ca-central-1.graphcms.com/v2/cl4g4ujw70ytc01z65xgxbgmm/master');

const QUERY = gql `
  {
    exercises(first: 36) {
      id, 
      title,
      slug,
      part,
      content
      coverPhoto {
        url
      }
    }
  }
`

const SLUGLIST = gql`
  {
    bodyParts {
      slug,
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
  const getFromStorage = (key) => {
    if(typeof window !== 'undefined'){
         window.localStorage.getItem(key)
    }
  }

  const setToStorage = (key,value) => {
    if(typeof window !== 'undefined'){
         return window.localStorage.setItem(key,value)
    }
  }

  //State
  const [state, setState] = useState({right: false});
  const [cart, setCart] = useState([{title: "Bench Press", slug: "bench-press"}]);

  //Fetch cart data and set it
  useEffect(() => {
    console.log(getFromStorage("cart"));
    if (getFromStorage("cart") == null) {
      setToStorage("cart", JSON.stringify([{title: "Bench Press", slug: "bench-press"}]));
      setCart([{title: "Bench Press", slug: "bench-press"}]);
      console.log("First time loading cart. Cart initialized to just bench press");
    } else {
      console.log(JSON.parse(getFromStorage("cart")));
      setCart(JSON.parse(getFromStorage("cart")))
      console.log("cart initialized to previous data");
    }
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
      <h1 className={styles.listTitle}>Saved Exercises</h1>
      <Divider />
      {(cart) 
        ? <List>
            {cart.map((exercise) => (
              <ListItem key={exercise.slug} disablePadding>
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
    </Box>
  );

  //Capitalizes the 'part' title
  const capitalizeFirst = str => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  


  //JSX
  return (
    <div className={styles.container}>
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
    
  );
}
