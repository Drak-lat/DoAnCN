package com.example.dacnapp.ui.product;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;
import com.example.dacnapp.data.model.product.ProductDetailResponse;

public class ProductPagerAdapter extends FragmentStateAdapter {
    private ProductDetailResponse.ProductDetail product;
    private int productId;

    public ProductPagerAdapter(@NonNull FragmentActivity fragmentActivity, ProductDetailResponse.ProductDetail product, int productId) {
        super(fragmentActivity);
        this.product = product;
        this.productId = productId;
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        switch (position) {
            case 0:
                return DescriptionFragment.newInstance(product != null ? product.text_product : "");
            case 1:
                return DetailsFragment.newInstance(
                    product != null ? product.publisher : null,
                    product != null ? product.page : 0,
                    product != null ? product.size : null,
                    product != null ? product.publisher_year : 0
                );
            case 2:
                return ReviewsFragment.newInstance(productId);
            default:
                return DescriptionFragment.newInstance("");
        }
    }

    @Override
    public int getItemCount() {
        return 3; // 3 tabs
    }
}
