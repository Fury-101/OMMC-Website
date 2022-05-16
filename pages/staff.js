import Head from 'next/head'
import Staff from '../components/Staff.js'
import Navbar from '../components/Navbar.js'
import Footer from '../components/Footer.js'
import Banner from '../components/Banner.js'

function App() {


    return (<>
        <Head>
            <title>OMMC</title>
        </Head>

        <Navbar></Navbar>
        <Banner></Banner>

        <Staff />

        <Footer></Footer>

    </>
    )
}

export default App;