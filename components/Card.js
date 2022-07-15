import Link from 'next/link'
import styles from '../styles/Card.module.css'
import Image from "next/image";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { IconButton} from '@mui/material';

export default function Card({title, coverPhoto, slug, addItem, part, color}) {
    return (
        <div className={styles.card} style={{backgroundColor: color}}>
            <Link href={`/exercises/${slug}`}>
                <div className={styles.imgContainer}>
                    <img src={coverPhoto.url} className={styles.coverPhoto} alt=""/>
                </div>
            </Link>
            <div className={styles.text}>
                <h2 className={styles.name}>{title}</h2>
            </div>
        </div>
    )
}