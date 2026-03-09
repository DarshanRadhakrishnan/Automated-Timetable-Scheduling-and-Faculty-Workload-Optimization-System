"use client";

import React, { useState } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import { useToast } from "@/context/ToastContext";

export default function UserPasswordCard() {
    const { isOpen, openModal, closeModal } = useModal();
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            addToast("Please fill in all fields", "error");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            addToast("New passwords do not match", "error");
            return;
        }

        if (formData.newPassword.length < 6) {
            addToast("Password must be at least 6 characters", "error");
            return;
        }

        // Simulate API call
        setTimeout(() => {
            addToast("Password updated successfully", "success");
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            closeModal();
        }, 1000);
    };

    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Password
                        </h4>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Update your password to keep your account secure.
                        </p>
                    </div>

                    <Button size="sm" onClick={openModal}>
                        Change Password
                    </Button>
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
                <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Change Password
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Enter your current password and a new strong password.
                        </p>
                    </div>
                    <form className="flex flex-col" onSubmit={handleSave}>
                        <div className="px-2 overflow-y-auto custom-scrollbar">
                            <div className="flex flex-col gap-5">
                                <div>
                                    <Label>Current Password</Label>
                                    <Input
                                        type="password"
                                        name="currentPassword"
                                        placeholder="Enter current password"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <Label>New Password</Label>
                                    <Input
                                        type="password"
                                        name="newPassword"
                                        placeholder="Enter new password"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <Label>Confirm Password</Label>
                                    <Input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm new password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal} type="button">
                                Close
                            </Button>
                            <Button size="sm" type="submit">
                                Update Password
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
