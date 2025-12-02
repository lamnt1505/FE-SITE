import React, { useState } from "react";
import Header from "./Header";
import ProductGrid from "./ProductGrid";
const SearchPage = () => {
  const [searchKey, setSearchKey] = useState("");

  return (
    <>
      <Header
        onSearch={(key) => {
          setSearchKey(key);
        }}
      />
      <ProductGrid searchKey={searchKey} />
    </>
  );
};

export default SearchPage;
