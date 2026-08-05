import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def train_svm_model():
    print("Loading breast cancer dataset...")
    data = load_breast_cancer()
    X = data.data
    y = data.target
    
    feature_names = data.feature_names
    
    print(f"Dataset shape: {X.shape}")
    print(f"Features: {len(feature_names)}")
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print("\nScaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training SVM classifier...")
    svm_model = SVC(kernel='rbf', probability=True, random_state=42)
    svm_model.fit(X_train_scaled, y_train)
    
    y_pred = svm_model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Malignant', 'Benign']))
    
   # Create model folder inside backend
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model_dir  = os.path.join(BASE_DIR, "model")
    os.makedirs(model_dir, exist_ok=True)

    model_path = os.path.join(model_dir, "svm_model.pkl")
    scaler_path = os.path.join(model_dir, "scaler.pkl")
    
    joblib.dump(svm_model, model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"\nModel saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")
    
    metadata = {
        'accuracy': float(accuracy),
        'n_features': len(feature_names),
        'feature_names': feature_names.tolist(),
        'target_names': ['Malignant', 'Benign']
    }
    
    return metadata

if __name__ == '__main__':
    metadata = train_svm_model()
    print("\n✓ Training completed successfully!")
