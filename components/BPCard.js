import Link from 'next/link'
import styles from '../styles/BPCard.module.css'

export default function BPCard({title, coverPhoto, slug, color}) {
    return (
        <div className={styles.card} style={{backgroundColor: color}}>
            <Link href={`/${slug}`}>
                <div className={styles.imgContainer}>
                    <img src={coverPhoto.url} alt=""/>
                </div>
            </Link>
            <div className={styles.text}>
                <h2 className={styles.name}>{title}</h2>
            </div>
        </div>
    )
}