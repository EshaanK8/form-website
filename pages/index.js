import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {GraphQLClient, gql} from 'graphql-request';
import Link from 'next/link';
import React, { useEffect, useState, Fragment } from "react";

//Components
import BPCard from "../components/BPCard";
import { flexbox } from '@mui/system';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';


const graphcms = new GraphQLClient('https://api-ca-central-1.graphcms.com/v2/cl4g4ujw70ytc01z65xgxbgmm/master');

const QUERY = gql `
{
  bodyParts(locales: [en]) {
    id
    title
    slug
    locale
    coverPhoto {
      url
    }
    localizations {
      id
      title
      slug
      locale
      coverPhoto {
      	url
    	}
    }
  }
}
`

//Generate info from api calls
export async function getStaticProps() {
  const {bodyParts} = await graphcms.request(QUERY);

  return {
    props: {
      bodyParts
    },
    revalidate: 30,
  };
}

const alternatingColor = ['#EAD6CD', '#8096FE', '#9BE0E3', '#9BE0E3', '#EAD6CD', '#8096FE']; //Card colours

export default function Home({ bodyParts }) {

  const setToStorage = (key,value) => {
    if(typeof window !== 'undefined'){
         return window.localStorage.setItem(key,value)
    }
  }

  //Fetch cart and language data
  useEffect(() => {
    const cart = window.localStorage.getItem("cart");
    const language = window.localStorage.getItem("language");

    if (cart == null) {
      setToStorage("cart", JSON.stringify([
        {
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
        }
      ]));
    }

    if (language == null) {
      setToStorage("language", "en");
    }

    setAlignment(language)
  }, []);

  //Toggle
  const [alignment, setAlignment] = React.useState('en');

  const handleChange = (event,newAlignment) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
      setToStorage("language", newAlignment)
    }
  };

  return (
    <div className={styles.bigContainer}>
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

      {(alignment == "en")
              ?
                <div>
                  <div className={styles.landingPage}>
                    <img className={styles.logo} src="/logo.svg"/>
                    <h1 className={styles.t1}>Train Smarter <span className={styles.t2}>Not Harder</span></h1>
                  </div>
                  <div>
                    <div className={styles.exploreTitleContainer}>
                      <h1 className={styles.exploreTitle}>Explore Our Workouts</h1>
                    </div>
                    {(bodyParts)
                      ? <div className={styles.partContainer}>
                          {bodyParts.map((post, index) => (
                              <BPCard
                                title={post.title}
                                coverPhoto={post.coverPhoto}
                                key={post.id}
                                slug={post.slug}
                                color={alternatingColor[index]}
                              />
                          ))}
                        </div>
                      : <div></div>
                    }
                  </div>
                </div>
              :
                <div>
                  <div className={styles.landingPage}>
                    <img className={styles.logo} src="/logo.svg"/>
                    <h1 className={styles.t1}>Entraînez-vous plus intelligemment <span className={styles.t2}>Pas Plus Fort</span></h1>
                  </div>
                  <div>
                    <div className={styles.exploreTitleContainer}>
                      <h1 className={styles.exploreTitle}>Découvrez Nos Entraînements</h1>
                    </div>
                    {(bodyParts)
                      ? <div className={styles.partContainer}>
                          {bodyParts.map((post, index) => (
                              <BPCard
                                title={post.localizations[0].title}
                                coverPhoto={post.coverPhoto}
                                key={post.localizations[0].id}
                                slug={post.localizations[0].slug}
                                color={alternatingColor[index]}
                              />
                          ))}
                        </div>
                      : <div></div>
                    }
                  </div>
                </div>
      }
      
    </div>
  );
}
