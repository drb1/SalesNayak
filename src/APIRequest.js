import axios from 'axios';
import TokenGetter from './TokenGetter';
import { API } from './API'

export const postRequest = (pathName, postData) => {

    let tempUrl = API(pathName);

    if (tempUrl) {
        console.log('entereed hit for post',tempUrl)
        return (
            axios({
                url: tempUrl,
                method: 'POST',
                data: postData,
            }).then((response) => {

                console.log(response)

            }).catch((error) => {

                console.log(error)
            })
        );
    }
};