import axios from "axios";
import { set } from "date-fns";
import React, { useState, useMemo, useEffect, useRef, useReducer, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
/* 
interface Row {
  id: number;
  name: string;
  age: number;
  city: string;
}

interface TableProps {
  data: Row[];
}

const DataTable: React.FC<TableProps> = ({ data }) => {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof Row>("id");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    if (!filter) return data;
    const lower = filter.toLowerCase();
    return data.filter(
      (r) => r.name.toLowerCase().includes(lower) || r.city.toLowerCase().includes(lower)
    );
  }, [data, filter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortAsc]);

  const toggleSort = (key: keyof Row) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };
  return (
    <div>
      <input
        placeholder="Search name or city"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            {(["id", "name", "age", "city"] as (keyof Row)[]).map((col) => (
              <th key={col} onClick={() => toggleSort(col)} style={{ cursor: "pointer" }}>
                {col.toUpperCase()}
                {sortKey === col ? (sortAsc ? " ▲" : " ▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.age}</td>
              <td>{row.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Example usage
const sampleData: Row[] = [
  { id: 1, name: "Alice", age: 30, city: "Seattle" },
  { id: 2, name: "Bob", age: 25, city: "Portland" },
  { id: 3, name: "Carol", age: 28, city: "San Francisco" },
];

const App: React.FC = () => (
  <div>
    <h1>People Table</h1>
    <DataTable data={sampleData} />
  </div>
);

export default App; */

// interface formDataDTO {
//   name:string,
//   age:number,
//   email:string
// }

// type reducerAction = | {
//   type:'OPEN',
//   data:stateProps,
//   modalName:string
// } | {
//   type:'CLOSE',
//   data:null,
//   modalName:null
// }

// interface stateProps {
//   name:string
//   modal:string
// }

// interface InitialRef{
//   fn1: () => void
//   fn2: () => void
// }
// const Test =() =>{
//  const reducer = (state:stateProps , action:reducerAction):stateProps =>{
//   switch(action.type){
//       case 'OPEN' : 
//         return {...state};

//       case 'CLOSE' : 
//         return {name:null , modal:null}
//     }
//  }

//  const [stateReducer , stateDispatch] = useReducer(reducer,{
//   name:null,
//   modal:null
//  })
//  useEffect(()=>{
//    stateReducer 
//  stateDispatch({
//   type:'OPEN',
//   data:{
//     name : 'CS',
//     modal : 'CDASC'
//   },
//   modalName:'CDASC'
//  })
//  },[])
//  const [value , setValue] = useState(0)
//  const initialRef = useRef<InitialRef>()
//  const btnRef = useRef<HTMLInputElement>()
//  function handleIncreDecre(type:'increment' | 'decrement'){
//  let num = Number(btnRef.current?.value) || 0
//   if(type === 'increment'){
//     setValue(prev=>prev+num )
//   }else{
//     setValue(prev=>prev-num )
//   }
// }
  
//  return (
//   <div className="">
//     <input type="text" className="block m-2 border border-1 border" name="showcase" value={value} readOnly />
//     <input type="text" className="m-2 border border-1" name="showcase" ref={btnRef} />
//     <button type="button" className = "btn-primary-rounded" onClick={()=>handleIncreDecre('increment')}>Increment</button>
//     <button type="button" className = "btn-primary-rounded" onClick={()=>handleIncreDecre('decrement')}>Decrement</button>
//    {/*  <button className="btn-primary-rounded" type="button" onClick={initialRef.current?.fn1}>
//       Invoke Function 1
//     </button>
//     <button type="button" className="btn-primary-rounded" onClick={initialRef.current?.fn2}>
//       Invoke Function 2
//     </button> */}
//     <ChildTest ref={initialRef} />
//   </div>
//  )
// }
// export {Test}
// const ChildTest = forwardRef((props  , ref) =>{
//   const [fn11 , setFn1] = useState({
//     fn1:false,
//     fn2:false
//   })
//   let fn1 = ()=>{
//     setFn1({
//       fn1:true,
//       fn2:false
//     })
//   }
//   let fn2 = ()=>{
//     setFn1({
//       fn1:false,
//       fn2:true
//     })
//   }
//   useImperativeHandle(ref,()=>({
//     fn1,
//     fn2
//   }))
//   return(
//     <div className="">
//       {fn11.fn1 ? <p>Function 1 is active</p> : <p>Function 2 is active</p>}
//     </div>
//   )
// })


// function fetchData(){

//   let blob = new Blob(chunks , {
//     type:mimType
//   })
//   let api = axios.create({
//     baseURL: 'https://jsonplaceholder.typicode.com',
//     headers: {
//       Authorization: localStorage.getItem('token') || '',
//       'Content-Type': 'multipart/form-data ',
//     },
//   })

//   api.interceptors.request.use(
//     (config)=>{
//       if(!api.defaults.headers){
//         throw new Error('Headers are not defined in the axios instance.');
//       }
//       return config
//     },
//     (error)=>{
//         if(error.response && error.response.status === 401) {
//           localStorage.removeItem('token');
//           window.location.href = '/login';
//         }
//         else{
//           console.error(error.message)
//           Promise.reject(error.message)
//         }
//     }
//   )

//   async function fetchCall(){
//     let query = {
//       name:'CS',
//       age:23,
//       email:'abc@gfmail.com'
//     }
//     const finalquery = new URLSearchParams(JSON.stringify(query)).toString()
//   let res =  await fetch(api.defaults.baseURL + '/posts' + finalquery , {
//       method:'POST',
//       headers:{
//         Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
//         'Content-Type': 'application/json'
//       },
//       body:JSON.stringify(query)
//     }
//     )
//     if(res.ok){
//       let data = await res.json()
//       console.log(data)
//     }else{
//       console.error('Error fetching data')
//     }
//   }

// }