import React from 'react'
import FzVariable from '../../../components/FzVariable';
const axios = require('axios').default;
const fzVariable = new FzVariable();
import { Carousel } from 'flowbite-react';
class News extends React.Component {

    state = {
        response: [],
        error: false,
        loading: false,
    };

    constructor(props) {
        super(props);
    }

    async getAllContracts() {
        this.setState({ allContracts: [], loading: true, error: false });
        try {
            const response = await axios.get('https://api.frazionz.net/news');
            this.setState({ response: response.data, loading: false, error: false, });
        } catch (error) {
            this.setState({ allContracts: [], loading: false, error: true });
        } finally {
            this.setState({ allContracts: [], loading: false, error: false });
        }
    }


    async componentDidMount() {
        await this.getAllContracts();
    }

    render() {
        const { error, loading, allContracts } = this.state;

        if (loading) {
            return <div className="spinner"></div>;
        }

        if (error) {
            return <div className="error">Something went wrong</div>;
        }

        return (
            <div className="news flex gap-5 flex-col">
                <h2 className="underline">{fzVariable.lang("server.news.title")}</h2>
                <div className="h-56 sm:h-64 xl:h-80 2xl:h-96">
                    <Carousel indicators={false} slideInterval={8000}>
                        {this.state.response.map((item, i) => {
                            return (
                                <div key={ i } className="flex h-full flex-col justify-end bg-gray-400 dark:bg-gray-700 dark:text-white bg-cover bg-center" style={{ background: 'url(https://frazionz.net/storage/posts/'+item.image+')', backdropFilter: 'blur(10px)'}}>
                                    <div className="ml-[38px] mb-[38px]">
                                        <h2 className="text-[48px] leading-[72px] font-bold font-['Poppins'] text-white">{ item.title }</h2>
                                    </div>
                                </div>
                            )
                        })}
                    </Carousel>
                </div>
            </div>
        );
    }


}

export default News;