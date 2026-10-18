import Navbar from "../components/navbar";
import Hero from "../components/hero";
import MadeFor from '../components/madefor'
import LocalArea from "../components/localarea";
import FAQS from '../components/faqs'
import Footer from '../components/footer'


export default function Home() {
    return(
        <>
            <Navbar />
            <Hero />
            <MadeFor />
            <LocalArea />
            <FAQS />
            <Footer />
        </>
    )
}