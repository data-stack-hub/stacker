import httpService from "./httpService";

class Stacker{
    constractor(){

    }

     get_data = async () => {
        const response:any = await httpService.get('/ping');
        console.log(response.data)
        if (response.status === 200) {
          console.log(response);
        } else {
          console.log(`Error: ${response.message}`);
        }
      }
}

const stacker = new Stacker();
export default stacker;