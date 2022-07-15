import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {GraphQLClient, gql} from 'graphql-request';
import Link from 'next/link';
import React, { useEffect, useState, Fragment } from "react";

//Components
import BPCard from "../components/BPCard";
import { flexbox } from '@mui/system';


const graphcms = new GraphQLClient('https://api-ca-central-1.graphcms.com/v2/cl4g4ujw70ytc01z65xgxbgmm/master');

const QUERY = gql `
  {
    bodyParts {
      id, 
      title,
      slug,
      coverPhoto {
        url
      }
    }
  }
`
//Generate info from api calls
export async function getStaticProps() {
  const {bodyParts} = await graphcms.request(QUERY);
  return {
    props: {
      bodyParts,
    },
    revalidate: 30,
  };
}

const alternatingColor = ['#EAD6CD', '#8096FE', '#9BE0E3', '#9BE0E3', '#EAD6CD', '#8096FE']; //Card colours

export default function Home({ bodyParts }) {

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

  //Fetch cart data
  useEffect(() => {
    console.log(getFromStorage("cart"));
    if (getFromStorage("cart") == null) {
      setToStorage("cart", JSON.stringify([{title: "Bench Press", slug: "bench-press"}]));
      console.log("First time loading cart. Cart initialized to just bench press");
    } else {
      console.log("Cart initialized to previous data " + getFromStorage("cart"));
    }
  }, []);

  return (
    <div className={styles.bigContainer}>
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
  );
}
