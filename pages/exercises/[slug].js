import styles from '../../styles/Slug.module.css'
import {GraphQLClient, gql} from 'graphql-request';
import YoutubeEmbed from "../../components/YoutubeEmbed";
import React, { useEffect, useState, Fragment } from "react";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DeleteIcon from '@mui/icons-material/Delete';
import Link from 'next/link';
import { RichText } from '@graphcms/rich-text-react-renderer';
import Comments from '../../components/Comments';
import Timer from '../../components/Timer';

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


const graphcms = new GraphQLClient('https://api-ca-central-1.graphcms.com/v2/cl4g4ujw70ytc01z65xgxbgmm/master');

const QUERY = gql`
  query Exercise($slug: String!) {
    exercise(locales: [en], where: { slug: $slug }) {
      id
      title
      slug
      video
      part
      content
      coverPhoto {
        id
        url
      }
      localizations {
        id
        title
        slug
        video
        part
        content
        coverPhoto {
          id
          url
        }
      }
    }
  }
`;
const SLUGLIST = gql`
  {
    exercises(first: 36) {
      slug,
    }
  }
`;

export async function getStaticPaths() {
  const { exercises } = await graphcms.request(SLUGLIST);
  return {
    paths: exercises.map((exercise) => ({ params: { slug: exercise.slug } })),
    fallback: false,
  };
}

//Generate info from api calls
export async function getStaticProps({ params }) {
  const slug = params.slug;
  const data = await graphcms.request(QUERY, { slug });
  const exercise = data.exercise;
  return {
    props: {
      exercise,
    },
    revalidate: 30,
  };
}

export default function Post({exercise}) {
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
  const [alignment, setAlignment] = React.useState('en');


  //Fetch cart data and set it
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
  if (!(cart.filter(function(e) { return e.id === product.id; }).length > 0)) {
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
                          <div>
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
                          </div>
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
                          <div>
                            <ListItem key={exercise.slug} disablePadding>
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
                          </div>
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
    setAlignment(newAlignment);
    setToStorage("language", newAlignment)
  };

  //JSX
  return (
    <div className={styles.container}>
      {(alignment == "en") 
          ? //ENGLISH
            <div>
              <div className={styles.topBar}>
                <div className={styles.titleBox}>
                  <Link href={`/${exercise.part}`}>
                    <IconButton aria-label="remove exercise">
                      <ArrowBackIcon className={styles.backIcon} sx={{ fontSize: "3rem" }}/>
                    </IconButton>
                  </Link>
                  <img src={`/${exercise.part}.png`} className={styles.partIcon}></img>
                  <h1 className={styles.title}>{`${capitalizeFirst(exercise.part)} / ${capitalizeFirst(exercise.title)}`}</h1>
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
                  <ToggleButtonGroup
                    color="primary"
                    value={alignment}
                    exclusive
                    onChange={handleChange}
                  >
                    <ToggleButton value="en">EN</ToggleButton>
                    <ToggleButton value="fr">FR</ToggleButton>
                    </ToggleButtonGroup>
                </div>
              </div>
              <main className={styles.contentBox}>
                <YoutubeEmbed embedId={exercise.video} />
                <div className={styles.nameBox}>
                  <div className={styles.eTitleBox}>
                    <h1 className={styles.eTitle}>About The {exercise.title}</h1>
                  </div>
                  {(cart)
                  ? <div className={styles.eButtonBox}>
                      {!(cart.filter(function(e) { return e.id === exercise.id; }).length > 0) ? (
                      <Button className={styles.saveButton} onClick={() => addToCart({title: exercise.title, slug: exercise.slug, id: exercise.id, localizations: exercise.localizations})}>Save Exercise</Button>
                      ) : (
                        <Button className={styles.savedButton}>Saved</Button>
                      )}
                    </div>
                  : <div></div>}
                </div>
                <p className={styles.content}>{exercise.content}</p>
                <h1 className={styles.dTitle}>Discussion</h1>
              </main>
              <Comments/>
              <Timer/>
            </div>

          : //FRENCH
            <div>
              <div>
                <div className={styles.topBar}>
                  <div className={styles.titleBox}>
                    <Link href={`/${exercise.part}`}>
                      <IconButton aria-label="remove exercise">
                        <ArrowBackIcon className={styles.backIcon} sx={{ fontSize: "3rem" }}/>
                      </IconButton>
                    </Link>
                    <img src={`/${exercise.part}.png`} className={styles.partIcon}></img>
                    <h1 className={styles.title}>{`${capitalizeFirst(exercise.localizations[0].part)} / ${capitalizeFirst(exercise.localizations[0].title)}`}</h1>
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
                    <ToggleButtonGroup
                      color="primary"
                      value={alignment}
                      exclusive
                      onChange={handleChange}
                    >
                      <ToggleButton value="en">EN</ToggleButton>
                      <ToggleButton value="fr">FR</ToggleButton>
                      </ToggleButtonGroup>
                  </div>
                </div>
                <main className={styles.contentBox}>
                  <YoutubeEmbed embedId={exercise.localizations[0].video} />
                  <div className={styles.nameBox}>
                    <div className={styles.eTitleBox}>
                      <h1 className={styles.eTitle}>À propos de le {exercise.localizations[0].title}</h1>
                    </div>
                    {(cart)
                    ? <div className={styles.eButtonBox}>
                        {!(cart.filter(function(e) { return e.id === exercise.id; }).length > 0) ? (
                        <Button className={styles.saveButton} onClick={() => addToCart({title: exercise.title, slug: exercise.localizations[0].slug, id: exercise.localizations[0].id, localizations: exercise.localizations})}>Enregistrer L'exercice</Button>
                        ) : (
                          <Button className={styles.savedButton}>Enregistré</Button>
                        )}
                      </div>
                    : <div></div>}
                  </div>
                  <p className={styles.content}>{exercise.localizations[0].content}</p>
                  <h1 className={styles.dTitle}>Discussion</h1>
                </main>
                <Comments/>
                <Timer/>
              </div>
            </div>
      }
    </div>
  )
}