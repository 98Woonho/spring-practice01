package com.whl.studybbs.entities;

import java.util.Date;
import java.util.Objects;

public class UserEntity {
    private String email;
    private String password;
    private String nickname;
    private String name;
    private String contactCompanyCode;
    private String contactFirst;
    private String contactSecond;
    private String contactThird;
    private String addressPostal;
    private String addressPrimary;
    private String addressSecondary;
    private boolean isAdmin;
    private boolean isSuspended;
    private boolean isDeleted;
    private Date registeredAt;
    private Date termPolicyAt;
    private Date termPrivacyAt;
    private Date termMarketingAt;


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactCompanyCode() {
        return contactCompanyCode;
    }

    public void setContactCompanyCode(String contactCompanyCode) {
        this.contactCompanyCode = contactCompanyCode;
    }

    public String getContactFirst() {
        return contactFirst;
    }

    public void setContactFirst(String contactFirst) {
        this.contactFirst = contactFirst;
    }

    public String getContactSecond() {
        return contactSecond;
    }

    public void setContactSecond(String contactSecond) {
        this.contactSecond = contactSecond;
    }

    public String getContactThird() {
        return contactThird;
    }

    public void setContactThird(String contactThird) {
        this.contactThird = contactThird;
    }

    public String getAddressPostal() {
        return addressPostal;
    }

    public void setAddressPostal(String addressPostal) {
        this.addressPostal = addressPostal;
    }

    public String getAddressPrimary() {
        return addressPrimary;
    }

    public void setAddressPrimary(String addressPrimary) {
        this.addressPrimary = addressPrimary;
    }

    public String getAddressSecondary() {
        return addressSecondary;
    }

    public void setAddressSecondary(String addressSecondary) {
        this.addressSecondary = addressSecondary;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }

    public boolean isSuspended() {
        return isSuspended;
    }

    public void setSuspended(boolean suspended) {
        isSuspended = suspended;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public Date getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(Date registeredAt) {
        this.registeredAt = registeredAt;
    }

    public Date getTermPolicyAt() {
        return termPolicyAt;
    }

    public void setTermPolicyAt(Date termPolicyAt) {
        this.termPolicyAt = termPolicyAt;
    }

    public Date getTermPrivacyAt() {
        return termPrivacyAt;
    }

    public void setTermPrivacyAt(Date termPrivacyAt) {
        this.termPrivacyAt = termPrivacyAt;
    }

    public Date getTermMarketingAt() {
        return termMarketingAt;
    }

    public void setTermMarketingAt(Date termMarketingAt) {
        this.termMarketingAt = termMarketingAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserEntity)) return false;
        UserEntity that = (UserEntity) o;
        return Objects.equals(getEmail(), that.getEmail());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getEmail());
    }
}
