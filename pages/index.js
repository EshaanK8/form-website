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
      setToStorage("cart", JSON.stringify([{title: "Bench Press", slug: "bench-press"}]));
    }

    if (language == null) {
      setToStorage("language", "en");
    }

    setAlignment(language)
  }, []);

  //Toggle
  const [alignment, setAlignment] = React.useState('en');

  const handleChange = (event,newAlignment) => {
    setAlignment(newAlignment);
    setToStorage("language", newAlignment)
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
            {(alignment == "en")
              ? bodyParts.map((post, index) => (
                  <BPCard
                    title={post.title}
                    coverPhoto={post.coverPhoto}
                    key={post.id}
                    slug={post.slug}
                    color={alternatingColor[index]}
                  />
                ))
              : bodyParts.map((post, index) => (
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
  );
}
