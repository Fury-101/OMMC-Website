import Head from 'next/head'
import Navbar from '../components/Navbar.js'
import Footer from '../components/Footer.js'
import Banner from '../components/Banner.js'
import Sponsors from '../components/Sponsors.js'

function App() {


    return (<>
        <Head>
            <title>OMMC</title>
        </Head>

        <Navbar></Navbar>
        <Banner></Banner>

        <Sponsors />

        <Footer></Footer>
    </>
    )
}

export default App;